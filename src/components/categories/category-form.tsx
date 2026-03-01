'use client'

import { useActionState, useEffect, useState } from 'react'
import { XIcon } from 'lucide-react'
import { createCategory, updateCategory } from '@/lib/actions/categories'
import type { Tables } from '@/types/database'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ActionState = { error?: string } | null

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
]

interface CategoryFormProps {
  categories: Tables<'categories'>[]
  editCategory?: Tables<'categories'>
  onClose: () => void
}

export function CategoryForm({ categories, editCategory, onClose }: CategoryFormProps) {
  const isEditing = Boolean(editCategory)
  const [selectedColor, setSelectedColor] = useState(editCategory?.color ?? '')

  async function formActionFn(_state: ActionState, formData: FormData): Promise<ActionState> {
    const result = isEditing
      ? await updateCategory(editCategory!.id, formData)
      : await createCategory(formData)
    return result ?? null
  }

  const [state, formAction, pending] = useActionState<ActionState, FormData>(formActionFn, null)

  useEffect(() => {
    if (!pending && state !== null && !state?.error) {
      onClose()
    }
  }, [state, pending, onClose])

  // Exclude self from parent dropdown when editing
  const parentOptions = categories.filter((c) => c.id !== editCategory?.id)

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          {isEditing ? 'Edit category' : 'New category'}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <div>
          <Label htmlFor="name" className="mb-1">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={editCategory?.name ?? ''}
            placeholder="e.g. Groceries"
          />
        </div>

        <div>
          <Label className="mb-1">Parent category (optional)</Label>
          <Select name="parent_id" defaultValue={editCategory?.parent_id ?? ''}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {parentOptions.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2">Color (optional)</Label>
          <input type="hidden" name="color" value={selectedColor} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedColor('')}
              className={cn(
                'size-7 rounded-full border-2 flex items-center justify-center text-xs text-muted-foreground transition-all',
                selectedColor === ''
                  ? 'border-foreground ring-2 ring-ring/50'
                  : 'border-border'
              )}
            >
              &#8709;
            </button>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={cn(
                  'size-7 rounded-full transition-all',
                  selectedColor === c
                    ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                    : 'ring-2 ring-transparent'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? 'Saving...' : isEditing ? 'Save changes' : 'Add category'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

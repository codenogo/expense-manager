'use client'

import { useState, useTransition } from 'react'
import { createRule, updateRule } from '@/lib/actions/rules'
import type { Tables } from '@/types/database'
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
import { Combobox } from '@/components/ui/combobox'

interface RuleFormProps {
  categories: Tables<'categories'>[]
  rule?: Tables<'categorization_rules'>
  onDone?: () => void
}

export function RuleForm({ categories, rule, onDone }: RuleFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)

    startTransition(async () => {
      const result = rule
        ? await updateRule(rule.id, formData)
        : await createRule(formData)

      if (result?.error) {
        setError(result.error)
      } else {
        onDone?.()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="match_pattern" className="mb-1">
            Pattern <span className="text-destructive">*</span>
          </Label>
          <Input
            id="match_pattern"
            name="match_pattern"
            type="text"
            required
            defaultValue={rule?.match_pattern ?? ''}
            placeholder="e.g. Safaricom"
          />
        </div>

        <div>
          <Label className="mb-1">
            Match type <span className="text-destructive">*</span>
          </Label>
          <Select name="match_type" defaultValue={rule?.match_type ?? 'contains'} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select match type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="exact">Exact</SelectItem>
              <SelectItem value="starts_with">Starts with</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1">
            Category <span className="text-destructive">*</span>
          </Label>
          <Combobox
            name="category_id"
            options={categoryOptions}
            defaultValue={rule?.category_id ?? ''}
            required
            placeholder="Select category"
            searchPlaceholder="Search categories..."
            emptyMessage="No categories found."
          />
        </div>

        <div>
          <Label htmlFor="priority" className="mb-1">Priority</Label>
          <Input
            id="priority"
            name="priority"
            type="number"
            defaultValue={rule?.priority ?? 0}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground mt-1">Higher number = higher priority</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : rule ? 'Update Rule' : 'Add Rule'}
        </Button>
        {onDone && (
          <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

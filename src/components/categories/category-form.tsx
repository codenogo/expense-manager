'use client'

import { useActionState, useEffect } from 'react'
import { createCategory, updateCategory } from '@/lib/actions/categories'
import type { Tables } from '@/types/database'

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

  // Exclude self and any descendant from parent dropdown when editing
  const parentOptions = categories.filter((c) => c.id !== editCategory?.id)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          {isEditing ? 'Edit category' : 'New category'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={editCategory?.name ?? ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Groceries"
          />
        </div>

        <div>
          <label htmlFor="parent_id" className="block text-sm font-medium text-slate-700 mb-1">
            Parent category (optional)
          </label>
          <select
            id="parent_id"
            name="parent_id"
            defaultValue={editCategory?.parent_id ?? ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">None</option>
            {parentOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Color (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="color"
                value=""
                defaultChecked={!editCategory?.color}
                className="sr-only"
              />
              <span className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400">
                &#8709;
              </span>
            </label>
            {PRESET_COLORS.map((c) => (
              <label key={c} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  defaultChecked={editCategory?.color === c}
                  className="sr-only peer"
                />
                <span
                  className="block w-6 h-6 rounded-full ring-2 ring-transparent peer-checked:ring-slate-700 peer-checked:ring-offset-1 transition-all"
                  style={{ backgroundColor: c }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Saving…' : isEditing ? 'Save changes' : 'Add category'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

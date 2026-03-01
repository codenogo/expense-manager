'use client'

import { useState, useTransition, useCallback } from 'react'
import { toast } from 'sonner'
import { deleteCategory } from '@/lib/actions/categories'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CategoryTree } from './category-tree'
import { CategoryForm } from './category-form'
import type { Tables } from '@/types/database'

interface CategoriesManagerProps {
  initialCategories: Tables<'categories'>[]
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editCategory, setEditCategory] = useState<Tables<'categories'> | undefined>()
  const [, startTransition] = useTransition()
  const { confirm, dialogProps } = useConfirmDialog()

  const handleEdit = useCallback((cat: Tables<'categories'>) => {
    setEditCategory(cat)
    setShowForm(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const cat = initialCategories.find((c) => c.id === id)
    const ok = await confirm({
      title: `Delete "${cat?.name ?? 'category'}"?`,
      description: 'This action cannot be undone. Transactions using this category will become uncategorized.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (!ok) return

    startTransition(async () => {
      const result = await deleteCategory(id)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }, [confirm, initialCategories])

  const handleClose = useCallback(() => {
    setShowForm(false)
    setEditCategory(undefined)
  }, [])

  const handleAdd = () => {
    setEditCategory(undefined)
    setShowForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Categories</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Add category
        </button>
      </div>

      {showForm && (
        <CategoryForm
          categories={initialCategories}
          editCategory={editCategory}
          onClose={handleClose}
        />
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <CategoryTree
          categories={initialCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}

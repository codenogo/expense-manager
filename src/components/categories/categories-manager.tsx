'use client'

import { useState, useTransition, useCallback } from 'react'
import { deleteCategory } from '@/lib/actions/categories'
import { CategoryTree } from './category-tree'
import { CategoryForm } from './category-form'
import type { Tables } from '@/types/database'

interface CategoriesManagerProps {
  initialCategories: Tables<'categories'>[]
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editCategory, setEditCategory] = useState<Tables<'categories'> | undefined>()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleEdit = useCallback((cat: Tables<'categories'>) => {
    setEditCategory(cat)
    setShowForm(true)
    setDeleteError(null)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteCategory(id)
      if (result?.error) {
        setDeleteError(result.error)
      }
    })
  }, [])

  const handleClose = useCallback(() => {
    setShowForm(false)
    setEditCategory(undefined)
  }, [])

  const handleAdd = () => {
    setEditCategory(undefined)
    setShowForm(true)
    setDeleteError(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Categories</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
        >
          Add category
        </button>
      </div>

      {deleteError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      {showForm && (
        <CategoryForm
          categories={initialCategories}
          editCategory={editCategory}
          onClose={handleClose}
        />
      )}

      <div className="bg-card rounded-xl border border-border p-1">
        <CategoryTree
          categories={initialCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

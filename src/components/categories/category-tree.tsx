'use client'

import { useState } from 'react'
import type { Tables } from '@/types/database'

interface CategoryNodeProps {
  category: Tables<'categories'>
  childCategories: Tables<'categories'>[]
  allCategories: Tables<'categories'>[]
  onEdit: (cat: Tables<'categories'>) => void
  onDelete: (id: string) => void
  depth: number
}

function CategoryNode({
  category,
  childCategories,
  allCategories,
  onEdit,
  onDelete,
  depth,
}: CategoryNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = childCategories.length > 0

  return (
    <div>
      <div
        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 group"
        style={{ paddingLeft: depth > 0 ? `${depth * 1.5 + 0.75}rem` : '0.75rem' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0 w-4 text-xs"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? '▾' : '▸'}
            </button>
          ) : (
            <span className="w-4 flex-shrink-0" />
          )}

          {category.color && (
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
          )}

          <span className="text-sm font-medium text-slate-800 truncate">{category.name}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="text-xs text-slate-500 hover:text-blue-600 px-2 py-1 rounded transition-colors"
            aria-label="Edit"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(category.id)}
            className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded transition-colors"
            aria-label="Delete"
          >
            Delete
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="border-l-2 border-gray-200 ml-5">
          {childCategories.map((child) => {
            const grandChildren = allCategories.filter((c) => c.parent_id === child.id)
            return (
              <CategoryNode
                key={child.id}
                category={child}
                childCategories={grandChildren}
                allCategories={allCategories}
                onEdit={onEdit}
                onDelete={onDelete}
                depth={depth + 1}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

interface CategoryTreeProps {
  categories: Tables<'categories'>[]
  onEdit: (cat: Tables<'categories'>) => void
  onDelete: (id: string) => void
}

export function CategoryTree({ categories, onEdit, onDelete }: CategoryTreeProps) {
  const rootCategories = categories.filter((c) => c.parent_id === null)

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-slate-500">
        No categories yet. Add your first category to start organizing your finances.
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100">
      {rootCategories.map((cat) => {
        const catChildren = categories.filter((c) => c.parent_id === cat.id)
        return (
          <CategoryNode
            key={cat.id}
            category={cat}
            childCategories={catChildren}
            allCategories={categories}
            onEdit={onEdit}
            onDelete={onDelete}
            depth={0}
          />
        )
      })}
    </div>
  )
}

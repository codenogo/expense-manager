'use client'

import { useState, useMemo } from 'react'
import type { Tables } from '@/types/database'

interface CategoryNodeProps {
  category: Tables<'categories'>
  childCategories: Tables<'categories'>[]
  childrenMap: Map<string | null, Tables<'categories'>[]>
  onEdit: (cat: Tables<'categories'>) => void
  onDelete: (id: string) => void
  depth: number
}

function CategoryNode({
  category,
  childCategories,
  childrenMap,
  onEdit,
  onDelete,
  depth,
}: CategoryNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = childCategories.length > 0

  return (
    <div>
      <div
        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 group"
        style={{ paddingLeft: depth > 0 ? `${depth * 1.5 + 0.75}rem` : '0.75rem' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0 w-4 text-xs"
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

          <span className="text-sm font-medium text-foreground truncate">{category.name}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded transition-colors"
            aria-label="Edit"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(category.id)}
            className="text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded transition-colors"
            aria-label="Delete"
          >
            Delete
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="border-l-2 border-border ml-5">
          {childCategories.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              childCategories={childrenMap.get(child.id) ?? []}
              childrenMap={childrenMap}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
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
  const childrenMap = useMemo(() => {
    const map = new Map<string | null, Tables<'categories'>[]>()
    for (const cat of categories) {
      const key = cat.parent_id
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(cat)
    }
    return map
  }, [categories])

  const rootCategories = childrenMap.get(null) ?? []

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        No categories yet. Add your first category to start organizing your finances.
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {rootCategories.map((cat) => (
        <CategoryNode
          key={cat.id}
          category={cat}
          childCategories={childrenMap.get(cat.id) ?? []}
          childrenMap={childrenMap}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={0}
        />
      ))}
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteRule } from '@/lib/actions/rules'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { RuleForm } from './rule-form'
import type { Tables } from '@/types/database'

const MATCH_TYPE_LABELS: Record<string, string> = {
  contains: 'contains',
  exact: 'exact',
  starts_with: 'starts with',
}

const MATCH_TYPE_COLORS: Record<string, string> = {
  contains: 'bg-blue-50 text-blue-700',
  exact: 'bg-violet-50 text-violet-700',
  starts_with: 'bg-amber-50 text-amber-700',
}

interface RuleListProps {
  rules: Tables<'categorization_rules'>[]
  categories: Tables<'categories'>[]
}

function RuleRow({
  rule,
  categories,
}: {
  rule: Tables<'categorization_rules'>
  categories: Tables<'categories'>[]
}) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { confirm, dialogProps } = useConfirmDialog()

  const category = categories.find((c) => c.id === rule.category_id)

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete rule?',
      description: `Remove the "${rule.match_pattern}" categorization rule?`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (!ok) return

    startTransition(async () => {
      const result = await deleteRule(rule.id)
      if (result?.error) toast.error(result.error)
    })
  }

  if (editing) {
    return (
      <li className="px-4 py-4">
        <RuleForm categories={categories} rule={rule} onDone={() => setEditing(false)} />
      </li>
    )
  }

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
            MATCH_TYPE_COLORS[rule.match_type] ?? 'bg-slate-100 text-slate-600'
          }`}
        >
          {MATCH_TYPE_LABELS[rule.match_type] ?? rule.match_type}
        </span>
        <span className="font-medium text-sm text-slate-900 truncate">{rule.match_pattern}</span>
        <span className="text-slate-400 text-sm flex-shrink-0">→</span>
        <span className="text-sm text-slate-600 truncate">{category?.name ?? 'Unknown category'}</span>
        {rule.priority !== 0 && (
          <span className="text-xs text-slate-400 flex-shrink-0">priority {rule.priority}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          disabled={isPending}
          className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Deleting...' : 'Delete'}
        </button>
      </div>
      <ConfirmDialog {...dialogProps} />
    </li>
  )
}

export function RuleList({ rules, categories }: RuleListProps) {
  if (rules.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-6 text-center">
        No rules yet. Add one below to start auto-categorizing transactions.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-slate-100">
      {rules.map((rule) => (
        <RuleRow key={rule.id} rule={rule} categories={categories} />
      ))}
    </ul>
  )
}

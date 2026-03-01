'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { quickCreateTransaction } from '@/lib/actions/transactions'
import type { Tables } from '@/types/database'

interface QuickEntrySheetProps {
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
  open: boolean
  onClose: () => void
}

export function QuickEntrySheet({
  accounts,
  categories,
  open,
  onClose,
}: QuickEntrySheetProps) {
  const [pending, setPending] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => amountRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  async function handleSubmit(formData: FormData) {
    setPending(true)
    const result = await quickCreateTransaction(formData)
    setPending(false)

    if (result.success) {
      toast.success('Transaction added')
      formRef.current?.reset()
      requestAnimationFrame(() => amountRef.current?.focus())
    } else {
      toast.error(result.error ?? 'Failed to add transaction')
    }
  }

  if (!open) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-end">
      <div
        className="fixed inset-0 bg-black/40 animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />
      <div
        className="relative w-full md:w-96 md:mr-6 bg-white rounded-t-2xl md:rounded-xl
          shadow-xl animate-[slideUp_200ms_ease-out] md:animate-[scaleIn_150ms_ease-out]
          max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-slate-900">Quick Entry</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form ref={formRef} action={handleSubmit} className="px-5 pb-5 space-y-4">
          <input type="hidden" name="date" value={today} />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {(['expense', 'income'] as const).map((t) => (
                <label key={t} className="flex-1 text-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    defaultChecked={t === 'expense'}
                    className="sr-only peer"
                  />
                  <span className="block px-4 py-2 text-sm font-medium text-slate-600
                    peer-checked:bg-blue-600 peer-checked:text-white transition-colors capitalize">
                    {t === 'expense' ? 'Expense' : 'Income'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="quick-amount" className="block text-sm font-medium text-slate-700 mb-1">
              Amount (KES)
            </label>
            <input
              ref={amountRef}
              id="quick-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                text-slate-900 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="quick-account" className="block text-sm font-medium text-slate-700 mb-1">
              Account
            </label>
            <select
              id="quick-account"
              name="account_id"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                text-slate-900
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" disabled>
                Select account
              </option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="quick-category"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Category <span className="text-slate-400">(optional)</span>
            </label>
            <select
              id="quick-category"
              name="category_id"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                text-slate-900
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quick-notes" className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="quick-notes"
              name="notes"
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                text-slate-900 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What was this for?"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-colors"
          >
            {pending ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}

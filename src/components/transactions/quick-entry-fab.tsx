'use client'

import { useState } from 'react'
import { QuickEntrySheet } from './quick-entry-sheet'
import type { Tables } from '@/types/database'

interface QuickEntryFabProps {
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
}

export function QuickEntryFab({ accounts, categories }: QuickEntryFabProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40
          w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg
          hover:bg-blue-700 active:scale-95 transition-all
          flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Quick add transaction"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <QuickEntrySheet
        accounts={accounts}
        categories={categories}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

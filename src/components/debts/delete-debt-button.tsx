'use client'

import { useState } from 'react'
import { deleteDebt } from '@/lib/actions/debts'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface DeleteDebtButtonProps {
  id: string
  name: string
}

export function DeleteDebtButton({ id, name }: DeleteDebtButtonProps) {
  const [deleting, setDeleting] = useState(false)
  const { confirm, dialogProps } = useConfirmDialog()

  async function handleDelete() {
    const ok = await confirm({
      title: `Delete "${name}"?`,
      description: 'This is permanent and cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (ok) {
      setDeleting(true)
      const action = deleteDebt.bind(null, id)
      await action()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium
          text-red-600 hover:bg-red-50 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {deleting ? 'Deleting...' : 'Delete Debt'}
      </button>
      <ConfirmDialog {...dialogProps} />
    </>
  )
}

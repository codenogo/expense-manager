'use client'

import { useState } from 'react'
import { deleteTransaction } from '@/lib/actions/transactions'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface DeleteTransactionButtonProps {
  id: string
}

export function DeleteTransactionButton({ id }: DeleteTransactionButtonProps) {
  const [deleting, setDeleting] = useState(false)
  const { confirm, dialogProps } = useConfirmDialog()

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete transaction?',
      description:
        'This will reverse its effect on the account balance. This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (ok) {
      setDeleting(true)
      const action = deleteTransaction.bind(null, id)
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
        {deleting ? 'Deleting...' : 'Delete Transaction'}
      </button>
      <ConfirmDialog {...dialogProps} />
    </>
  )
}

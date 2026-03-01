'use client'

import { deleteDebt } from '@/lib/actions/debts'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface DeleteDebtButtonProps {
  id: string
  name: string
}

export function DeleteDebtButton({ id, name }: DeleteDebtButtonProps) {
  const { confirm, dialogProps } = useConfirmDialog()

  async function handleDelete() {
    const ok = await confirm({
      title: `Delete "${name}"?`,
      description: 'This is permanent and cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (ok) {
      const action = deleteDebt.bind(null, id)
      await action()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium
          text-red-600 hover:bg-red-50 transition-colors"
      >
        Delete Debt
      </button>
      <ConfirmDialog {...dialogProps} />
    </>
  )
}

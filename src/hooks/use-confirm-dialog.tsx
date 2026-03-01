'use client'

import { useState, useCallback, useRef } from 'react'

interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  variant?: 'danger' | 'default'
}

interface DialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  variant: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function useConfirmDialog() {
  const [dialogProps, setDialogProps] = useState<DialogProps>({
    open: false,
    title: '',
    description: undefined,
    confirmLabel: 'Confirm',
    variant: 'default',
    onConfirm: () => {},
    onCancel: () => {},
  })

  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve

      setDialogProps({
        open: true,
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        variant: options.variant ?? 'default',
        onConfirm: () => {
          setDialogProps((prev) => ({ ...prev, open: false }))
          resolve(true)
        },
        onCancel: () => {
          setDialogProps((prev) => ({ ...prev, open: false }))
          resolve(false)
        },
      })
    })
  }, [])

  return { confirm, dialogProps }
}

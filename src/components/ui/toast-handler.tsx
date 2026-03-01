'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export function ToastHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const toastMsg = searchParams.get('toast')
    const errorMsg = searchParams.get('error')

    if (toastMsg) {
      toast.success(toastMsg)
    }
    if (errorMsg) {
      toast.error(errorMsg)
    }

    if (toastMsg || errorMsg) {
      const cleaned = new URLSearchParams(searchParams.toString())
      cleaned.delete('toast')
      cleaned.delete('error')
      const qs = cleaned.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    }
  }, [searchParams, router, pathname])

  return null
}

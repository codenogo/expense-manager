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
      router.replace(pathname)
    }
  }, [searchParams, router, pathname])

  return null
}

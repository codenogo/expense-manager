'use client'

import { useSidebar } from './sidebar-provider'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <main
      className={`pt-14 pb-16 md:pb-0 transition-all duration-300 ${
        collapsed ? 'md:ml-16' : 'md:ml-64'
      }`}
    >
      {children}
    </main>
  )
}


'use client'

import { createContext, useContext, useState, useEffect, useCallback, useSyncExternalStore } from 'react'

interface SidebarContextValue {
  collapsed: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
})

const STORAGE_KEY = 'sidebar-collapsed'

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function getServerSnapshot(): boolean {
  return false
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [collapsed, setCollapsed] = useState(storedValue)

  useEffect(() => {
    setCollapsed(storedValue)
  }, [storedValue])

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {}
      return next
    })
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext)
}


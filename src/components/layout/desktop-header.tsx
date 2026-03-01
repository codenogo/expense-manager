'use client'

import { NotificationBell } from '@/components/notifications/notification-bell'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useSidebar } from './sidebar-provider'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface DesktopHeaderProps {
  householdId: string
}

export function DesktopHeader({ householdId }: DesktopHeaderProps) {
  const { collapsed, toggle } = useSidebar()

  return (
    <header
      className={`hidden md:flex fixed top-0 right-0 z-40 h-14 items-center justify-between border-b border-border bg-card px-4 transition-all duration-300 ${
        collapsed ? 'left-16' : 'left-64'
      }`}
    >
      <button
        onClick={toggle}
        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <PanelLeftOpen className="w-5 h-5" />
        ) : (
          <PanelLeftClose className="w-5 h-5" />
        )}
      </button>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell householdId={householdId} />
      </div>
    </header>
  )
}


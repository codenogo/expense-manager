'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface SidebarProps {
  householdName: string
  householdId: string
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/budget', label: 'Budget' },
  { href: '/bills', label: 'Bills' },
  { href: '/debts', label: 'Debts' },
  { href: '/savings', label: 'Savings' },
  { href: '/reports', label: 'Reports' },
  { href: '/import', label: 'Import' },
  { href: '/categories', label: 'Categories' },
  { href: '/accounts', label: 'Accounts' },
  { href: '/settings/rules', label: 'Settings' },
]

export function Sidebar({ householdName, householdId }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-card border-r border-border">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground truncate">{householdName}</h1>
          <NotificationBell householdId={householdId} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Finance Planner</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

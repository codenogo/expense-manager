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
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-white border-r border-slate-200">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-slate-900 truncate">{householdName}</h1>
          <NotificationBell householdId={householdId} />
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Finance Planner</p>
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
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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

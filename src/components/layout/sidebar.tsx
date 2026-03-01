'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from './sidebar-provider'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Receipt,
  CreditCard,
  Target,
  BarChart3,
  Upload,
  Tags,
  Wallet,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SidebarProps {
  householdName: string
}

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budget', label: 'Budget', icon: PiggyBank },
  { href: '/bills', label: 'Bills', icon: Receipt },
  { href: '/debts', label: 'Debts', icon: CreditCard },
  { href: '/savings', label: 'Savings', icon: Target },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/import', label: 'Import', icon: Upload },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/accounts', label: 'Accounts', icon: Wallet },
  { href: '/settings/rules', label: 'Settings', icon: Settings },
]

export function Sidebar({ householdName }: SidebarProps) {
  const pathname = usePathname()
  const { collapsed } = useSidebar()

  return (
    <aside
      className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200 transition-all duration-300 z-50 ${
        collapsed ? 'md:w-16' : 'md:w-64'
      }`}
    >
      <div
        className={`py-5 border-b border-slate-100 ${collapsed ? 'px-3' : 'px-6'}`}
      >
        {collapsed ? (
          <div className="flex items-center justify-center">
            <span className="text-base font-bold text-slate-900">
              {householdName.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <>
            <h1 className="text-base font-semibold text-slate-900 truncate">
              {householdName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Finance Planner</p>
          </>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg text-sm transition-colors ${
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
              } ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

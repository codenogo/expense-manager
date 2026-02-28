import Link from 'next/link'
import { AccountForm } from '@/components/accounts/account-form'

export default function NewAccountPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/accounts"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Accounts
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg font-semibold text-slate-900">New Account</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <AccountForm />
      </main>
    </div>
  )
}

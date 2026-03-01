'use client'

interface Notification {
  id: string
  type: 'bill_overdue' | 'budget_overspend' | 'low_balance'
  title: string
  body: string
  read: boolean
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  bill_overdue: { bg: 'bg-red-50', text: 'text-red-700', label: 'Overdue' },
  budget_overspend: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Overspent' },
  low_balance: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Low Balance' },
}

interface NotificationListProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
}

export function NotificationList({ notifications, onMarkRead, onMarkAllRead }: NotificationListProps) {
  const hasUnread = notifications.some((n) => !n.read)

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
        {hasUnread && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-400">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.bill_overdue
            return (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-slate-50 last:border-b-0 ${
                  n.read ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${style.bg} ${style.text}`}
                      >
                        {style.label}
                      </span>
                      <span className="text-[10px] text-slate-400">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      className="shrink-0 mt-1 w-2 h-2 rounded-full bg-blue-500 hover:bg-blue-700"
                      aria-label="Mark as read"
                    />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

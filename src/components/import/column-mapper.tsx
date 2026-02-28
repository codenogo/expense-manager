'use client'

import { useState } from 'react'
import { parseAmount, parseDate } from '@/lib/csv-parser'

export interface ColumnMapping {
  date: number
  amount: number
  description: number | null
}

interface ColumnMapperProps {
  headers: string[]
  sampleRows: string[][]
  initialMapping?: Partial<ColumnMapping> | null
  onConfirm: (mapping: ColumnMapping) => void
}

export function ColumnMapper({ headers, sampleRows, initialMapping, onConfirm }: ColumnMapperProps) {
  const [dateCol, setDateCol] = useState<number>(initialMapping?.date ?? -1)
  const [amountCol, setAmountCol] = useState<number>(initialMapping?.amount ?? -1)
  const [descriptionCol, setDescriptionCol] = useState<number | null>(
    initialMapping?.description ?? null
  )

  const preview = sampleRows.slice(0, 3)
  const canConfirm = dateCol >= 0 && amountCol >= 0

  function handleConfirm() {
    if (!canConfirm) return
    onConfirm({ date: dateCol, amount: amountCol, description: descriptionCol })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Map Columns</h2>
        <p className="text-sm text-slate-500 mt-1">
          Tell us which columns contain dates, amounts, and descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Date column <span className="text-red-500">*</span>
          </label>
          <select
            value={dateCol}
            onChange={(e) => setDateCol(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={-1}>-- Select --</option>
            {headers.map((h, i) => (
              <option key={i} value={i}>{h}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Amount column <span className="text-red-500">*</span>
          </label>
          <select
            value={amountCol}
            onChange={(e) => setAmountCol(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={-1}>-- Select --</option>
            {headers.map((h, i) => (
              <option key={i} value={i}>{h}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Description column</label>
          <select
            value={descriptionCol ?? -1}
            onChange={(e) => setDescriptionCol(Number(e.target.value) === -1 ? null : Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={-1}>-- None --</option>
            {headers.map((h, i) => (
              <option key={i} value={i}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700">Preview (first 3 rows)</h3>
          <div className="rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {preview.map((row, i) => {
                  const rawDate = dateCol >= 0 ? row[dateCol] : ''
                  const rawAmount = amountCol >= 0 ? row[amountCol] : ''
                  const parsedDate = rawDate ? parseDate(rawDate) : null
                  const parsedAmount = rawAmount ? parseAmount(rawAmount) : null
                  const desc = descriptionCol !== null ? row[descriptionCol] : ''

                  return (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-700">
                        {parsedDate ?? <span className="text-red-500">{rawDate || '--'}</span>}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {parsedAmount !== null
                          ? (parsedAmount / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })
                          : <span className="text-slate-400">--</span>
                        }
                      </td>
                      <td className="px-3 py-2 text-slate-500">{desc || '--'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Preview
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { CSVUpload } from './csv-upload'
import { ColumnMapper, type ColumnMapping } from './column-mapper'
import { ImportPreview } from './import-preview'
import { detectHeaders, parseAmount, parseDate, type ParsedCSV } from '@/lib/csv-parser'
import type { Tables } from '@/types/database'

type Step = 'upload' | 'map' | 'preview' | 'done'

interface MappedTransaction {
  date: string
  amount: number
  type: 'income' | 'expense'
  notes: string | null
}

interface ImportWizardProps {
  accounts: Tables<'accounts'>[]
  categories: Tables<'categories'>[]
}

export function ImportWizard({ accounts, categories }: ImportWizardProps) {
  const [step, setStep] = useState<Step>('upload')
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null)
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState<ColumnMapping | null>(null)
  const [transactions, setTransactions] = useState<MappedTransaction[]>([])
  const [importedCount, setImportedCount] = useState(0)

  function handleParsed(data: ParsedCSV, name: string) {
    setParsedCSV(data)
    setFileName(name)
    setStep('map')
  }

  function handleMapping(m: ColumnMapping) {
    if (!parsedCSV) return
    setMapping(m)

    const mapped: MappedTransaction[] = []
    for (const row of parsedCSV.rows) {
      const rawDate = row[m.date] ?? ''
      const rawAmount = row[m.amount] ?? ''
      const rawNotes = m.description !== null ? row[m.description] ?? null : null

      const date = parseDate(rawDate)
      if (!date) continue

      const cents = parseAmount(rawAmount)
      if (cents === 0) continue

      mapped.push({
        date,
        amount: Math.abs(cents),
        type: cents < 0 ? 'expense' : 'income',
        notes: rawNotes,
      })
    }

    setTransactions(mapped)
    setStep('preview')
  }

  function handleDone(count: number) {
    setImportedCount(count)
    setStep('done')
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'upload', label: '1. Upload' },
    { key: 'map', label: '2. Map Columns' },
    { key: 'preview', label: '3. Preview & Import' },
  ]

  if (step === 'done') {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Import Complete</h2>
        <p className="text-sm text-slate-500">
          Successfully imported <span className="font-medium text-slate-700">{importedCount}</span> transactions.
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="/transactions"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Transactions
          </a>
          <button
            onClick={() => { setStep('upload'); setParsedCSV(null); setMapping(null); setTransactions([]) }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Import Another File
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex gap-2 text-sm">
        {steps.map((s) => (
          <span
            key={s.key}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              s.key === step
                ? 'bg-blue-100 text-blue-700'
                : steps.findIndex((x) => x.key === step) > steps.findIndex((x) => x.key === s.key)
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {s.label}
          </span>
        ))}
        {fileName && (
          <span className="ml-auto text-xs text-slate-400 self-center truncate max-w-xs">{fileName}</span>
        )}
      </div>

      {step === 'upload' && <CSVUpload onParsed={handleParsed} />}

      {step === 'map' && parsedCSV && (
        <ColumnMapper
          headers={parsedCSV.headers}
          sampleRows={parsedCSV.rows}
          initialMapping={detectHeaders(parsedCSV.headers)}
          onConfirm={handleMapping}
        />
      )}

      {step === 'preview' && (
        <ImportPreview
          transactions={transactions}
          accounts={accounts}
          categories={categories}
          onBack={() => setStep('map')}
          onDone={handleDone}
        />
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { parseAmount, parseDate } from '@/lib/csv-parser'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
        <h2 className="text-base font-semibold text-foreground">Map Columns</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us which columns contain dates, amounts, and descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label className="mb-1">
            Date column <span className="text-destructive">*</span>
          </Label>
          <Select
            value={String(dateCol)}
            onValueChange={(val) => setDateCol(Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">-- Select --</SelectItem>
              {headers.map((h, i) => (
                <SelectItem key={i} value={String(i)}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1">
            Amount column <span className="text-destructive">*</span>
          </Label>
          <Select
            value={String(amountCol)}
            onValueChange={(val) => setAmountCol(Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">-- Select --</SelectItem>
              {headers.map((h, i) => (
                <SelectItem key={i} value={String(i)}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1">Description column</Label>
          <Select
            value={String(descriptionCol ?? -1)}
            onValueChange={(val) => setDescriptionCol(Number(val) === -1 ? null : Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-1">-- None --</SelectItem>
              {headers.map((h, i) => (
                <SelectItem key={i} value={String(i)}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Preview (first 3 rows)</h3>
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {preview.map((row, i) => {
                  const rawDate = dateCol >= 0 ? row[dateCol] : ''
                  const rawAmount = amountCol >= 0 ? row[amountCol] : ''
                  const parsedDate = rawDate ? parseDate(rawDate) : null
                  const parsedAmount = rawAmount ? parseAmount(rawAmount) : null
                  const desc = descriptionCol !== null ? row[descriptionCol] : ''

                  return (
                    <tr key={i}>
                      <td className="px-3 py-2 text-foreground">
                        {parsedDate ?? <span className="text-destructive">{rawDate || '--'}</span>}
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {parsedAmount !== null
                          ? (parsedAmount / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })
                          : <span className="text-muted-foreground">--</span>
                        }
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{desc || '--'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={!canConfirm}>
          Continue to Preview
        </Button>
      </div>
    </div>
  )
}

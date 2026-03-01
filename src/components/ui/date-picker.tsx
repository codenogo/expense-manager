'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  name?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  onChange?: (value: string) => void
}

function DatePicker({
  name,
  defaultValue,
  placeholder = 'Pick a date',
  disabled,
  required,
  className,
  onChange,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    defaultValue ? new Date(defaultValue + 'T00:00:00') : undefined
  )
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selected: Date | undefined) => {
    setDate(selected)
    setOpen(false)
    const isoValue = selected ? selected.toISOString().split('T')[0] : ''
    onChange?.(isoValue)
  }

  const formattedValue = date
    ? date.toISOString().split('T')[0]
    : ''

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="size-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          defaultMonth={date}
        />
      </PopoverContent>
      {name && <input type="hidden" name={name} value={formattedValue} required={required} />}
    </Popover>
  )
}

export { DatePicker }
export type { DatePickerProps }

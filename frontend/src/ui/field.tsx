import type { ComponentProps } from 'react'
import { cn } from '@/platform/cn'
import { Input } from './shadcn/input'

/** A labelled, required input as wide as its form. */
export function Field({
  label,
  ...props
}: ComponentProps<typeof Input> & { label: string }) {
  return (
    <label htmlFor={props.id} className="flex w-full flex-col gap-xs">
      {label}
      <Input className="w-full" required {...props} />
    </label>
  )
}

/** The account's forms: fields stacked, the button at their start. */
export function FieldForm({ className, ...props }: ComponentProps<'form'>) {
  return (
    <form
      method="post"
      className={cn('mt-md flex flex-col items-start gap-sm', className)}
      {...props}
    />
  )
}

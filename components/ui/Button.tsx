import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'sm' | 'md'

type ButtonClassOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
  secondary: 'bg-white border border-gray-300 text-slate-900 hover:bg-gray-100 dark:bg-transparent dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800',
  danger: 'bg-red-500/25 border border-red-400/40 hover:bg-red-500/35',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonClassOptions = {}) {
  return clsx(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && 'w-full', className)
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export default function Button({ variant = 'primary', size = 'md', fullWidth = false, className, ...props }: ButtonProps) {
  return <button className={buttonClasses({ variant, size, fullWidth, className })} {...props} />
}
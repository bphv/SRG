import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'info'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  block?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--srg-color-primary-500)] text-white border-transparent hover:bg-[var(--srg-color-primary-600)]',
  secondary: 'bg-[var(--srg-surface-strong)] text-[var(--srg-text-body)] border-[var(--srg-border)] hover:bg-[var(--srg-hover)]',
  ghost: 'bg-transparent text-[var(--srg-text-body)] border-transparent hover:bg-[var(--srg-hover)]',
  danger: 'bg-[var(--srg-color-danger-500)] text-white border-transparent hover:bg-[var(--srg-color-danger-600)]',
  success: 'bg-[var(--srg-color-success-500)] text-white border-transparent hover:bg-[var(--srg-color-success-600)]',
  warning: 'bg-[var(--srg-color-warning-500)] text-white border-transparent hover:bg-[var(--srg-color-warning-600)]',
  info: 'bg-[var(--srg-color-info-500)] text-white border-transparent hover:bg-[var(--srg-color-info-600)]',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-2xl',
  lg: 'px-5 py-3 text-base rounded-2xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  block,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center justify-center gap-2 border font-semibold shadow-[var(--srg-shadow-sm)] transition disabled:cursor-not-allowed disabled:opacity-50',
        variantClass[variant],
        sizeClass[size],
        block ? 'w-full' : '',
        className ?? '',
      ].join(' ').trim()}
    >
      {leftIcon ? <span aria-hidden>{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span aria-hidden>{rightIcon}</span> : null}
    </button>
  )
}

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'info'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?: ButtonVariant
  outline?: boolean
  iconOnly?: boolean
  floating?: boolean
  split?: boolean
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
  outline = false,
  iconOnly = false,
  floating = false,
  split = false,
  size = 'md',
  leftIcon,
  rightIcon,
  block,
  className,
  children,
  ...props
}: ButtonProps) {
  const outlineClass = outline
    ? 'bg-transparent border-[var(--srg-border)] text-[var(--srg-text-body)] hover:bg-[var(--srg-hover)]'
    : variantClass[variant]

  const iconOnlyClass = iconOnly
    ? 'px-0 py-0 h-10 w-10 rounded-xl'
    : sizeClass[size]

  return (
    <button
      {...props}
      className={[
        'inline-flex items-center justify-center gap-2 border font-semibold shadow-[var(--srg-shadow-sm)] transition disabled:cursor-not-allowed disabled:opacity-50',
        outlineClass,
        iconOnlyClass,
        floating ? 'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-[var(--srg-shadow-lg)]' : '',
        split ? 'rounded-l-xl rounded-r-xl pr-2' : '',
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

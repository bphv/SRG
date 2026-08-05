import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info'
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
  primary: 'bg-[var(--srg-official-navy)] text-white border-[color-mix(in_oklab,var(--srg-official-gold)_26%,transparent)] hover:bg-[var(--srg-color-primary-600)]',
  secondary: 'bg-[var(--srg-official-card)] text-[var(--srg-official-foreground)] border-[var(--srg-border)] hover:border-[color-mix(in_oklab,var(--srg-official-gold)_34%,var(--srg-border))] hover:bg-[var(--srg-hover)]',
  outline: 'bg-transparent text-[var(--srg-official-foreground)] border-[color-mix(in_oklab,var(--srg-official-gold)_32%,var(--srg-border))] hover:bg-[var(--srg-hover)]',
  ghost: 'bg-transparent text-[var(--srg-official-foreground)] border-transparent hover:bg-[var(--srg-hover)]',
  danger: 'bg-[var(--srg-color-danger-500)] text-white border-transparent hover:bg-[var(--srg-color-danger-600)]',
  success: 'bg-[var(--srg-color-success-500)] text-white border-transparent hover:bg-[var(--srg-color-success-600)]',
  warning: 'bg-[var(--srg-official-gold)] text-[var(--srg-official-foreground)] border-transparent hover:bg-[var(--srg-color-warning-600)]',
  info: 'bg-[color-mix(in_oklab,var(--srg-official-navy)_82%,white)] text-white border-transparent hover:bg-[var(--srg-color-info-600)]',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs rounded-xl',
  md: 'h-10 px-4 text-sm rounded-2xl',
  lg: 'h-11 px-5 text-base rounded-2xl',
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
    ? 'h-10 w-10 px-0 py-0 rounded-xl'
    : sizeClass[size]

  return (
    <button
      {...props}
      className={[
        'inline-flex items-center justify-center gap-2 border font-semibold shadow-[var(--srg-shadow-sm)] transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--srg-color-info-400)]',
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

import type { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary'
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const variantClasses =
    variant === 'secondary'
      ? 'bg-gray-100 text-gray-700'
      : 'bg-black text-white'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variantClasses} ${className}`}
      {...props}
    />
  )
}

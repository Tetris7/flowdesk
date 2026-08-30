import { initials } from '../../lib/utils'

export default function Avatar({
  name,
  color,
  size = 'md',
}: {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = { sm: 'h-6 w-6 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-14 w-14 text-lg' }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-display font-semibold text-white flex-shrink-0 ${sizes[size]}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials(name)}
    </span>
  )
}

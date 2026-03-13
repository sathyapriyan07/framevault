export default function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm transition'
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    ghost: 'bg-white/10 hover:bg-white/20 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

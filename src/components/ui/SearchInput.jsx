import { useEffect, useState } from 'react'

export default function SearchInput({ value, onChange, placeholder = 'Search...', delay = 400 }) {
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  useEffect(() => {
    const handle = setTimeout(() => {
      onChange?.(localValue)
    }, delay)
    return () => clearTimeout(handle)
  }, [localValue, delay, onChange])

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
    />
  )
}

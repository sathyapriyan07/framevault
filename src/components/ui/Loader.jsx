export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-16 text-gray-400">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}

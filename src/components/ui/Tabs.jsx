export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`rounded-full px-4 py-2 text-sm transition ${
            activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

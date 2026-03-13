export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-2 md:gap-3 overflow-x-auto scroll-hidden pb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-shrink-0 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm ${
            activeTab === tab ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] hover:bg-[#262626] text-gray-300'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

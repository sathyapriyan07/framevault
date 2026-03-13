import { downloadFile, openDownload } from '../../utils/downloadHelper'

export default function BackdropCard({ backdrop, variant = 'row' }) {
  const url = backdrop.download_url || backdrop.backdrop_url
  const filename = `backdrop-${backdrop.id}.jpg`
  
  const isRow = variant === 'row'
  
  return (
    <div className={`bg-[#111111] rounded-lg overflow-hidden shadow-sm ${
      isRow ? 'w-[220px] md:w-[260px] lg:w-[300px] flex-shrink-0' : 'w-full'
    }`}>
      <div className="aspect-[16/9] w-full overflow-hidden">
        <img
          src={backdrop.backdrop_url}
          alt="Backdrop"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex gap-2 p-2">
        <button 
          onClick={() => downloadFile(url, filename)} 
          className="px-3 py-1 text-xs rounded-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Download
        </button>
        <button 
          onClick={() => openDownload(backdrop.backdrop_url)} 
          className="px-3 py-1 text-xs rounded-full bg-[#1a1a1a] hover:bg-[#262626] text-white"
        >
          Open
        </button>
      </div>
    </div>
  )
}

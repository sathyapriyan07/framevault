import { downloadFile, openDownload } from '../../utils/downloadHelper'

export default function BackdropCard({ backdrop }) {
  const url = backdrop.download_url || backdrop.backdrop_url
  const filename = `backdrop-${backdrop.id}.jpg`
  
  return (
    <div className="bg-neutral-900 rounded-2xl overflow-hidden w-[280px] flex-shrink-0 group cursor-pointer transition duration-300 hover:scale-105">
      <div className="aspect-[16/9] w-full overflow-hidden">
        <img
          src={backdrop.backdrop_url}
          alt="Backdrop"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex gap-2 p-4">
        <button 
          onClick={() => downloadFile(url, filename)} 
          className="px-3 py-1 text-sm rounded-full bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          Download
        </button>
        <button 
          onClick={() => openDownload(backdrop.backdrop_url)} 
          className="px-3 py-1 text-sm rounded-full bg-neutral-700 hover:bg-neutral-600 text-white transition"
        >
          Open
        </button>
      </div>
    </div>
  )
}

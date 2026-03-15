import { downloadFile, openDownload } from '../../utils/downloadHelper'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function PosterCard({ poster }) {
  const src = poster.poster_url
  const url = poster.download_url || poster.poster_url
  const filename = `poster-${poster.id}.jpg`
  
  return (
    <div className="rounded-lg bg-[#111111] overflow-hidden shadow-sm w-[140px] md:w-[180px] lg:w-[220px] flex-shrink-0">
      <div className="aspect-[2/3] overflow-hidden">
        <ProgressiveImage src={src} alt="Poster" className="h-full" imgClassName="w-full h-full object-cover" />
      </div>
      <div className="p-2">
        <div className="flex gap-1.5">
          <button 
            onClick={() => downloadFile(url, filename)} 
            className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 px-2 py-1 text-[10px] md:text-xs text-white"
          >
            Download
          </button>
          <button 
            onClick={() => openDownload(src)} 
            className="rounded-full bg-[#1a1a1a] hover:bg-[#262626] px-2 py-1 text-[10px] md:text-xs text-white"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  )
}

import { downloadFile, openDownload } from '../../utils/downloadHelper'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function PosterCard({ poster }) {
  const url = poster.download_url || poster.poster_url
  const filename = `poster-${poster.id}.jpg`
  
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="rounded-3xl bg-dark-card overflow-hidden shadow-2xl w-[140px] sm:w-[180px] lg:w-[200px] flex-shrink-0">
      <div className="aspect-[2/3] w-full">
        <ProgressiveImage src={poster.poster_url} alt="Poster" className="h-full" imgClassName="w-full h-full object-cover" />
      </div>
      <div className="p-2 sm:p-3">
        <div className="flex gap-1.5">
          <button 
            onClick={() => downloadFile(url, filename)} 
            className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 px-2 py-1 text-[10px] sm:text-xs text-white transition"
          >
            Download
          </button>
          <button 
            onClick={() => openDownload(poster.poster_url)} 
            className="rounded-full bg-neutral-700 hover:bg-neutral-600 px-2 py-1 text-[10px] sm:text-xs text-white transition"
          >
            Open
          </button>
        </div>
      </div>
    </motion.div>
  )
}

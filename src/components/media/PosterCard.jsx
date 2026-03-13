import { downloadFile, openDownload } from '../../utils/downloadHelper'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function PosterCard({ poster }) {
  const url = poster.download_url || poster.poster_url
  const filename = `poster-${poster.id}.jpg`
  
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="rounded-3xl bg-dark-card overflow-hidden shadow-2xl w-[200px] flex-shrink-0">
      <ProgressiveImage src={poster.poster_url} alt="Poster" className="h-72" />
      <div className="p-4">
        <div className="flex gap-2">
          <button 
            onClick={() => downloadFile(url, filename)} 
            className="rounded-full bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs text-white transition"
          >
            Download
          </button>
          <button 
            onClick={() => openDownload(poster.poster_url)} 
            className="rounded-full bg-neutral-700 hover:bg-neutral-600 px-3 py-1 text-xs text-white transition"
          >
            Open
          </button>
        </div>
      </div>
    </motion.div>
  )
}

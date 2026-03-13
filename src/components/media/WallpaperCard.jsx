import { downloadFile, openDownload } from '../../utils/downloadHelper'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function WallpaperCard({ wallpaper }) {
  const url = wallpaper.download_url || wallpaper.image_url
  const filename = `wallpaper-${wallpaper.id}.jpg`
  
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="rounded-3xl bg-dark-card overflow-hidden shadow-2xl w-[220px] sm:w-[240px] lg:w-[260px] flex-shrink-0">
      <div className="aspect-[16/9] w-full">
        <ProgressiveImage src={wallpaper.image_url} alt="Wallpaper" className="h-full" imgClassName="w-full h-full object-cover" />
      </div>
      <div className="p-2 sm:p-3">
        {wallpaper.resolution && (
          <p className="text-[10px] sm:text-xs text-gray-400 mb-1.5">{wallpaper.resolution}</p>
        )}
        <div className="flex gap-1.5">
          <button
            onClick={() => downloadFile(url, filename)}
            className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 px-2 py-1 text-[10px] sm:text-xs text-white transition"
          >
            Download
          </button>
          <button
            onClick={() => openDownload(wallpaper.image_url)}
            className="rounded-full bg-neutral-700 hover:bg-neutral-600 px-2 py-1 text-[10px] sm:text-xs text-white transition"
          >
            Open
          </button>
        </div>
      </div>
    </motion.div>
  )
}

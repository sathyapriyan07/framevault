import { downloadFile, openDownload } from '../../utils/downloadHelper'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function WallpaperCard({ wallpaper }) {
  const url = wallpaper.download_url || wallpaper.image_url
  const filename = `wallpaper-${wallpaper.id}.jpg`
  
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="rounded-3xl bg-dark-card overflow-hidden shadow-2xl w-[260px] flex-shrink-0">
      <ProgressiveImage src={wallpaper.image_url} alt="Wallpaper" className="h-56" />
      <div className="p-4">
        {wallpaper.resolution && (
          <p className="text-xs text-gray-400 mb-2">{wallpaper.resolution}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => downloadFile(url, filename)}
            className="rounded-full bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs text-white transition"
          >
            Download
          </button>
          <button
            onClick={() => openDownload(wallpaper.image_url)}
            className="rounded-full bg-neutral-700 hover:bg-neutral-600 px-3 py-1 text-xs text-white transition"
          >
            Open
          </button>
        </div>
      </div>
    </motion.div>
  )
}

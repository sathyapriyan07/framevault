import { downloadFile, openDownload } from '../../utils/downloadHelper'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function WallpaperCard({ wallpaper }) {
  const url = wallpaper.download_url || wallpaper.image_url
  const filename = `wallpaper-${wallpaper.id}.jpg`
  
  return (
    <div className="rounded-lg bg-dark-card overflow-hidden shadow-sm w-[220px] md:w-[240px] lg:w-[260px] flex-shrink-0">
      <div className="aspect-[16/9] w-full">
        <ProgressiveImage src={wallpaper.image_url} alt="Wallpaper" className="h-full" imgClassName="w-full h-full object-cover" />
      </div>
      <div className="p-2">
        {wallpaper.resolution && (
          <p className="text-[10px] md:text-xs text-gray-400 mb-1.5">{wallpaper.resolution}</p>
        )}
        <div className="flex gap-1.5">
          <button
            onClick={() => downloadFile(url, filename)}
            className="flex-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] md:text-xs text-white"
          >
            Download
          </button>
          <button
            onClick={() => openDownload(wallpaper.image_url)}
            className="rounded-full bg-neutral-700 px-2 py-1 text-[10px] md:text-xs text-white"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  )
}

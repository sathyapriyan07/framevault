import { downloadFile, openDownload } from '../../utils/downloadHelper'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'
import { getMediaDownloadUrl, getMediaImageUrl } from '../../utils/mediaStorage'

export default function WallpaperCard({ wallpaper }) {
  const src = getMediaImageUrl('wallpapers', wallpaper)
  const url = getMediaDownloadUrl('wallpapers', wallpaper)
  const filename = `wallpaper-${wallpaper.id}.jpg`
  
  return (
    <div className="rounded-lg bg-[#111111] overflow-hidden shadow-sm w-[220px] md:w-[240px] lg:w-[260px] flex-shrink-0">
      <div className="aspect-[16/9] w-full">
        <ProgressiveImage src={src} alt="Wallpaper" className="h-full" imgClassName="w-full h-full object-cover" />
      </div>
      <div className="p-2">
        {wallpaper.resolution && (
          <p className="text-[10px] md:text-xs text-gray-400 mb-1.5">{wallpaper.resolution}</p>
        )}
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

import { downloadFile, openDownload } from '../../utils/downloadHelper'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function LogoCard({ logo }) {
  const pngUrl = logo.png_download || logo.logo_url
  const svgUrl = logo.svg_download
  const pngFilename = `logo-${logo.id}.png`
  const svgFilename = `logo-${logo.id}.svg`
  
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="rounded-3xl bg-dark-card overflow-hidden shadow-2xl w-[160px] sm:w-[200px] lg:w-[240px] flex-shrink-0">
      <div className="aspect-square w-full flex items-center justify-center p-3 sm:p-4">
        <img
          src={logo.logo_url}
          alt="Logo"
          className="max-w-[70%] max-h-[70%] object-contain"
          loading="lazy"
        />
      </div>
      <div className="p-2 sm:p-3">
        <div className="flex gap-1.5">
          {pngUrl && (
            <button
              onClick={() => downloadFile(pngUrl, pngFilename)}
              className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 px-2 py-1 text-[10px] sm:text-xs text-white transition font-medium"
            >
              PNG
            </button>
          )}
          {svgUrl && (
            <button
              onClick={() => downloadFile(svgUrl, svgFilename)}
              className="flex-1 rounded-full bg-green-600 hover:bg-green-700 px-2 py-1 text-[10px] sm:text-xs text-white transition font-medium"
            >
              SVG
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

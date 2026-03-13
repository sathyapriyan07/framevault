import { downloadFile, openDownload } from '../../utils/downloadHelper'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function LogoCard({ logo }) {
  const pngUrl = logo.png_download || logo.logo_url
  const svgUrl = logo.svg_download
  const pngFilename = `logo-${logo.id}.png`
  const svgFilename = `logo-${logo.id}.svg`
  
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="rounded-3xl bg-dark-card overflow-hidden shadow-2xl w-[220px] flex-shrink-0">
      <ProgressiveImage
        src={logo.logo_url}
        alt="Logo"
        className="h-40 p-6"
        imgClassName="object-contain"
      />
      <div className="p-4">
        <div className="flex gap-2">
          {pngUrl && (
            <button
              onClick={() => downloadFile(pngUrl, pngFilename)}
              className="rounded-full bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs text-white transition"
            >
              PNG
            </button>
          )}
          {svgUrl && (
            <button
              onClick={() => downloadFile(svgUrl, svgFilename)}
              className="rounded-full bg-green-600 hover:bg-green-700 px-3 py-1 text-xs text-white transition"
            >
              SVG
            </button>
          )}
          <button
            onClick={() => openDownload(logo.logo_url)}
            className="rounded-full bg-neutral-700 hover:bg-neutral-600 px-3 py-1 text-xs text-white transition"
          >
            Open
          </button>
        </div>
      </div>
    </motion.div>
  )
}

import { downloadFile } from '../../utils/downloadHelper'
import { getMediaDownloadUrl, getMediaImageUrl } from '../../utils/mediaStorage'

export default function LogoCard({ logo }) {
  const src = getMediaImageUrl('logos', logo)
  const primaryDownloadUrl = getMediaDownloadUrl('logos', logo)
  const svgUrl = logo.svg_download
  const primaryFilename = `logo-${logo.id}.png`
  const svgFilename = `logo-${logo.id}.svg`
  
  return (
    <div className="rounded-lg bg-[#111111] overflow-hidden shadow-sm w-[150px] md:w-[200px] lg:w-[240px] flex-shrink-0">
      <div className="aspect-square w-full flex items-center justify-center p-3">
        {src ? (
          <img
            src={src}
            alt="Logo"
            className="max-w-[70%] max-h-[70%] object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-black/30 rounded" />
        )}
      </div>
      <div className="p-2">
        <div className="flex gap-1.5">
          {primaryDownloadUrl && (
            <button
              onClick={() => downloadFile(primaryDownloadUrl, primaryFilename)}
              className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 px-2 py-1 text-[10px] md:text-xs text-white font-medium"
            >
              Download
            </button>
          )}
          {svgUrl && (
            <button
              onClick={() => downloadFile(svgUrl, svgFilename)}
              className="flex-1 rounded-full bg-green-600 hover:bg-green-700 px-2 py-1 text-[10px] md:text-xs text-white font-medium"
            >
              SVG
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

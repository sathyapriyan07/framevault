import WallpaperCard from '../../components/media/WallpaperCard'
import Loader from '../../components/ui/Loader'
import Row from '../../components/ui/Row'
import { useWallpapers } from '../../hooks/useWallpapers'

export default function WallpapersPage() {
  const { data, loading } = useWallpapers()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-heading font-bold mb-8">Wallpapers</h1>
      {loading ? (
        <Loader />
      ) : (
        <Row title="All Wallpapers">
          {data.map((wallpaper) => (
            <div key={wallpaper.id} className="min-w-[260px]">
              <WallpaperCard wallpaper={wallpaper} />
            </div>
          ))}
        </Row>
      )}
    </div>
  )
}

import PosterCard from '../../components/media/PosterCard'
import Loader from '../../components/ui/Loader'
import Row from '../../components/ui/Row'
import { usePosters } from '../../hooks/usePosters'

export default function PostersPage() {
  const { data, loading } = usePosters()

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 pt-4 md:py-12">
        <h1 className="text-2xl md:text-4xl font-heading font-bold mb-6 md:mb-8">Posters</h1>
        {loading ? (
          <Loader />
        ) : (
          <Row title="All Posters">
            {data.map((poster) => (
              <div key={poster.id} className="min-w-[140px] md:min-w-[200px]">
                <PosterCard poster={poster} />
              </div>
            ))}
          </Row>
        )}
      </div>
    </div>
  )
}

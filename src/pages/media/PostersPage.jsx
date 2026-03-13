import PosterCard from '../../components/media/PosterCard'
import Loader from '../../components/ui/Loader'
import Row from '../../components/ui/Row'
import { usePosters } from '../../hooks/usePosters'

export default function PostersPage() {
  const { data, loading } = usePosters()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-heading font-bold mb-8">Posters</h1>
      {loading ? (
        <Loader />
      ) : (
        <Row title="All Posters">
          {data.map((poster) => (
            <div key={poster.id} className="min-w-[200px]">
              <PosterCard poster={poster} />
            </div>
          ))}
        </Row>
      )}
    </div>
  )
}

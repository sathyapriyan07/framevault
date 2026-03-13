import BackdropCard from '../../components/media/BackdropCard'
import Loader from '../../components/ui/Loader'
import Row from '../../components/ui/Row'
import { useBackdrops } from '../../hooks/useBackdrops'

export default function BackdropsPage() {
  const { data, loading } = useBackdrops()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-heading font-bold mb-8">Backdrops</h1>
      {loading ? (
        <Loader />
      ) : (
        <Row title="All Backdrops">
          {data.map((backdrop) => (
            <div key={backdrop.id} className="min-w-[260px]">
              <BackdropCard backdrop={backdrop} />
            </div>
          ))}
        </Row>
      )}
    </div>
  )
}

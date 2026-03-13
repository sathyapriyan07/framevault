import LogoCard from '../../components/media/LogoCard'
import Loader from '../../components/ui/Loader'
import Row from '../../components/ui/Row'
import { useLogos } from '../../hooks/useLogos'

export default function LogosPage() {
  const { data, loading } = useLogos()

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 pt-4 md:py-12">
        <h1 className="text-2xl md:text-4xl font-heading font-bold mb-6 md:mb-8">Logos</h1>
        {loading ? (
          <Loader />
        ) : (
          <Row title="All Logos">
            {data.map((logo) => (
              <div key={logo.id} className="min-w-[150px] md:min-w-[200px]">
                <LogoCard logo={logo} />
              </div>
            ))}
          </Row>
        )}
      </div>
    </div>
  )
}

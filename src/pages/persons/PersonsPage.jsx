import { useEffect, useState } from 'react'
import { personService } from '../../services/personService'
import PersonCard from '../../components/media/PersonCard'
import Row from '../../components/ui/Row'
import Loader from '../../components/ui/Loader'

export default function PersonsPage() {
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await personService.getAll()
      setPersons(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 pt-4 md:py-12">
        <h1 className="text-2xl md:text-4xl font-heading font-bold mb-6 md:mb-8">Persons</h1>
        {loading ? (
          <Loader />
        ) : (
          <Row title="Featured Persons">
            {persons.map((person) => (
              <div key={person.id} className="min-w-[140px] md:min-w-[200px]">
                <PersonCard person={person} />
              </div>
            ))}
          </Row>
        )}
      </div>
    </div>
  )
}

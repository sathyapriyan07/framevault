import { useEffect, useState } from 'react'
import { homepageSectionService } from '../../services/homepageSectionService'
import MediaRow from '../../components/ui/MediaRow'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    const { data } = await homepageSectionService.getActiveSections()
    setSections(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-black/80 to-transparent py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-3 sm:mb-4"
          >
            Media Archive
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-2xl"
          >
            A premium archive for wallpapers, title logos, posters, and cinematic backdrops.
          </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12 lg:space-y-16 overflow-x-hidden">
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="py-4 sm:py-6 lg:py-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold mb-4 sm:mb-5 lg:mb-6">{section.title}</h2>
              <MediaRow type={section.type} limit={section.limit_count} />
            </div>
          ))
        )}
      </section>
    </div>
  )
}

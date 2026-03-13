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
      <section className="relative h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-6 md:pb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-4xl lg:text-6xl font-heading font-bold mb-2"
          >
            Media Archive
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-sm md:text-base text-neutral-400 max-w-2xl"
          >
            A premium archive for wallpapers, title logos, posters, and cinematic backdrops.
          </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6 md:py-12 space-y-6 md:space-y-12 overflow-x-hidden">
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="mt-6 md:mt-8">
              <h2 className="text-lg md:text-2xl lg:text-3xl font-heading font-semibold mb-3 md:mb-5">{section.title}</h2>
              <MediaRow type={section.type} limit={section.limit_count} />
            </div>
          ))
        )}
      </section>
    </div>
  )
}

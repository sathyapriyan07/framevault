import { useEffect, useState } from 'react'
import { homepageSectionService } from '../../services/homepageSectionService'
import MediaDenseGrid from '../../components/ui/MediaDenseGrid'
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
    <div className="min-h-screen bg-black overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        <section>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-semibold font-heading"
          >
            Media Archive
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-sm text-neutral-400 mt-2 max-w-md font-body"
          >
            Browse wallpapers, title logos, posters, and cinematic backdrops.
          </motion.p>
        </section>

        <section className="space-y-6 overflow-x-hidden">
          {loading ? (
            <div className="text-sm text-neutral-400 font-body">Loading...</div>
          ) : (
            sections.map((section) => (
              <div key={section.id}>
                <h2 className="text-lg font-semibold mb-3 font-heading">{section.title}</h2>
                <MediaDenseGrid type={section.type} limit={section.limit_count} />
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  )
}

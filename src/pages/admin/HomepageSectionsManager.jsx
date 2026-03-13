import { useEffect, useState } from 'react'
import { homepageSectionService } from '../../services/homepageSectionService'

export default function HomepageSectionsManager() {
  const [sections, setSections] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    type: 'movies',
    limit_count: 10,
    sort_order: 0,
    is_active: true
  })

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    const { data } = await homepageSectionService.getAllSections()
    setSections(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      await homepageSectionService.updateSection(editingId, formData)
    } else {
      await homepageSectionService.createSection(formData)
    }
    resetForm()
    loadSections()
  }

  const handleEdit = (section) => {
    setFormData({
      title: section.title,
      type: section.type,
      limit_count: section.limit_count,
      sort_order: section.sort_order,
      is_active: section.is_active
    })
    setEditingId(section.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this section?')) {
      await homepageSectionService.deleteSection(id)
      loadSections()
    }
  }

  const handleToggle = async (id, currentStatus) => {
    await homepageSectionService.toggleSection(id, !currentStatus)
    loadSections()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'movies',
      limit_count: 10,
      sort_order: 0,
      is_active: true
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading font-bold">Homepage Sections</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded transition"
        >
          {showForm ? 'Cancel' : 'Add Section'}
        </button>
      </div>

      {showForm && (
        <div className="bg-dark-card p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-heading font-semibold mb-4">
            {editingId ? 'Edit Section' : 'New Section'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Media Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 rounded"
              >
                <option value="movies">Movies</option>
                <option value="series">Series</option>
                <option value="wallpapers">Wallpapers</option>
                <option value="logos">Logos</option>
                <option value="posters">Posters</option>
                <option value="backdrops">Backdrops</option>
                <option value="persons">Persons</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Limit Count</label>
              <input
                type="number"
                value={formData.limit_count}
                onChange={(e) => setFormData({ ...formData, limit_count: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-800 rounded"
                min="1"
                max="50"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-800 rounded"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <label>Active</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded transition"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-dark-card p-6 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold mb-1">{section.title}</h3>
              <p className="text-gray-400 text-sm">
                Type: {section.type} • Limit: {section.limit_count} • Order: {section.sort_order}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(section.id, section.is_active)}
                className={`px-4 py-2 rounded text-sm transition ${
                  section.is_active
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {section.is_active ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => handleEdit(section)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(section.id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

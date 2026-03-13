import { Link } from 'react-router-dom'
import AuthPanel from '../../components/ui/AuthPanel'

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-heading font-bold mb-6">Admin Dashboard</h1>
      <div className="mb-8">
        <AuthPanel />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/import" className="bg-dark-card p-8 rounded-lg hover:bg-gray-800 transition">
          <h3 className="text-2xl font-heading font-semibold mb-2">TMDB Import</h3>
          <p className="text-gray-400">Import movies and assets from TMDB</p>
        </Link>
        <Link to="/admin/media" className="bg-dark-card p-8 rounded-lg hover:bg-gray-800 transition">
          <h3 className="text-2xl font-heading font-semibold mb-2">Movies Manager</h3>
          <p className="text-gray-400">Edit or delete movie metadata</p>
        </Link>
        <Link to="/admin/media" className="bg-dark-card p-8 rounded-lg hover:bg-gray-800 transition">
          <h3 className="text-2xl font-heading font-semibold mb-2">Media Manager</h3>
          <p className="text-gray-400">Edit or delete media entries</p>
        </Link>
        <Link to="/admin/add-person" className="bg-dark-card p-8 rounded-lg hover:bg-gray-800 transition">
          <h3 className="text-2xl font-heading font-semibold mb-2">Persons</h3>
          <p className="text-gray-400">Import and manage persons</p>
        </Link>
        <Link to="/admin/homepage-sections" className="bg-dark-card p-8 rounded-lg hover:bg-gray-800 transition">
          <h3 className="text-2xl font-heading font-semibold mb-2">Homepage Sections</h3>
          <p className="text-gray-400">Manage homepage collections</p>
        </Link>
      </div>
    </div>
  )
}

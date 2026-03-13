import { Link } from 'react-router-dom'

export default function PersonCard({ person }) {
  return (
    <Link to={`/person/${person.id}`} className="block w-[180px] flex-shrink-0">
      <div className="relative overflow-hidden rounded-3xl group bg-neutral-900 h-[340px] shadow-lg">
        <img
          src={person.profile_url || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={person.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-heading font-semibold text-lg leading-tight mb-1">
            {person.name}
          </h3>
          <p className="text-gray-300 text-sm">
            {person.known_for || 'Crew / Cast'}
          </p>
        </div>
      </div>
    </Link>
  )
}

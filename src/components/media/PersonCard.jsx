import { Link } from 'react-router-dom'

export default function PersonCard({ person }) {
  return (
    <Link to={`/person/${person.id}`} className="block w-[140px] md:w-[160px] lg:w-[180px] flex-shrink-0">
      <div className="relative overflow-hidden rounded-lg bg-neutral-900 h-64 md:h-80 lg:h-[340px] shadow-sm">
        <img
          src={person.profile_url || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={person.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="text-[12px] md:text-sm font-medium text-white leading-tight mb-1 line-clamp-2">
            {person.name}
          </h3>
          <p className="text-[10px] md:text-xs text-gray-300 truncate">
            {person.known_for || 'Crew / Cast'}
          </p>
        </div>
      </div>
    </Link>
  )
}

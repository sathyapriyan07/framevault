import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie.id}`} className="block w-[180px] flex-shrink-0">
      <div className="relative rounded-2xl overflow-hidden group h-80 shadow-lg">
        <img 
          src={movie.poster_url} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-heading font-semibold text-lg leading-tight mb-1">
            {movie.title}
          </h3>
          <p className="text-gray-300 text-sm">{movie.release_year}</p>
        </div>

        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-xs font-medium">
            {movie.type}
          </span>
        </div>
      </div>
    </Link>
  )
}

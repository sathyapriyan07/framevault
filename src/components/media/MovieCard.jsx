import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie.id}`} className="block w-[140px] sm:w-[160px] lg:w-[180px] flex-shrink-0">
      <div className="relative rounded-2xl overflow-hidden group h-64 sm:h-72 lg:h-80 shadow-lg">
        <img 
          src={movie.poster_url} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="text-[12px] sm:text-sm lg:text-base font-medium text-white leading-tight mb-1 truncate">
            {movie.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-300">{movie.release_year}</p>
        </div>

        <div className="absolute top-2 right-2">
          <span className="text-[10px] px-2 py-[2px] rounded-full bg-white/10 backdrop-blur text-white font-medium">
            {movie.type}
          </span>
        </div>
      </div>
    </Link>
  )
}

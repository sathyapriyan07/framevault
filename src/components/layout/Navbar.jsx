import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import SearchModal from '../ui/SearchModal'

const navItems = [
  { to: '/movies', label: 'Movies' },
  { to: '/series', label: 'Series' },
  { to: '/persons', label: 'Persons' },
  { to: '/wallpapers', label: 'Wallpapers' },
  { to: '/logos', label: 'Logos' },
  { to: '/posters', label: 'Posters' },
  { to: '/backdrops', label: 'Backdrops' }
]

export default function Navbar() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return
      setSession(data?.session ?? null)
      if (data?.session?.user?.id) {
        const { data: roleData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single()
        if (isMounted) setRole(roleData?.role ?? null)
      } else {
        setRole(null)
      }
    }
    load()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return
      setSession(newSession)
      if (newSession?.user?.id) {
        supabase
          .from('users')
          .select('role')
          .eq('id', newSession.user.id)
          .single()
          .then(({ data }) => {
            if (isMounted) setRole(data?.role ?? null)
          })
      } else {
        setRole(null)
      }
    })
    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`sticky top-0 z-50 transition ${isScrolled ? 'bg-black/90 border-b border-white/10' : 'bg-transparent'} backdrop-blur`}>
      {/* Top Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="text-2xl font-heading font-semibold text-white">
            Media Archive
          </NavLink>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `transition ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          
          {/* Right Side Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSearch(true)}
              className="rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition"
              aria-label="Open search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm0 0 7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {role === 'admin' ? (
              <NavLink to="/admin" className="rounded-full bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700 transition">
                Admin
              </NavLink>
            ) : (
              <NavLink to="/signin" className="rounded-full bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700 transition">
                {session?.user ? 'Account' : 'Sign In'}
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden border-t border-white/10">
        <div className="flex gap-3 overflow-x-auto scroll-hidden px-4 py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`px-4 py-2 text-sm whitespace-nowrap rounded-full transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
              >
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </div>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </nav>
  )
}

import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
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
  const [showMenu, setShowMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const menuRef = useRef(null)

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleNavClick = (to) => {
    navigate(to)
    setShowMenu(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-black backdrop-blur border-b border-neutral-800">
      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 h-12">
          <NavLink to="/" className="text-lg font-heading font-semibold text-white">
            Media Archive
          </NavLink>
          
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowSearch(true)}
              className="p-1 text-white"
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm0 0 7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-white"
                aria-label="Menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              
              {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-[#111111] border border-[#222222] shadow-lg overflow-hidden">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.to
                    return (
                      <button
                        key={item.to}
                        onClick={() => handleNavClick(item.to)}
                        className={`block w-full text-left px-4 py-3 text-sm ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-white hover:bg-[#1a1a1a]'
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                  
                  {role === 'admin' && (
                    <>
                      <div className="border-t border-[#222222]"></div>
                      <button
                        onClick={() => handleNavClick('/admin')}
                        className={`block w-full text-left px-4 py-3 text-sm ${
                          location.pathname === '/admin'
                            ? 'bg-blue-600 text-white'
                            : 'text-white hover:bg-[#1a1a1a]'
                        }`}
                      >
                        Admin
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="text-2xl font-heading font-semibold text-white">
              Media Archive
            </NavLink>
            
            <div className="flex items-center gap-5 text-sm">
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
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(true)}
                className="rounded-full bg-[#1a1a1a] px-3 py-2 text-white hover:bg-[#262626] transition"
                aria-label="Search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
      </div>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </nav>
  )
}

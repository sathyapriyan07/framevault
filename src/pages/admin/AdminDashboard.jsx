import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'

function DownloadIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3v10m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FilmIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 6h16v12H4zM8 6v12M16 6v12M4 10h4M4 14h4M16 10h4M16 14h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ImageIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m21 16-5.5-5.5L6 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 21a8 8 0 1 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LayoutIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 7h8M8 11h8M8 15h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ActionTile({ to, title, description, Icon }) {
  return (
    <Link
      to={to}
      className="bg-[#111] rounded-xl p-4 transition-colors hover:bg-[#171717] active:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-white/10"
    >
      <div className="flex items-start gap-2">
        {Icon && <Icon className="w-4 h-4 mt-0.5 text-neutral-300" />}
        <div className="min-w-0">
          <h3 className="text-sm font-medium font-heading truncate">{title}</h3>
          <p className="text-xs text-neutral-400 font-body mt-1 leading-snug">{description}</p>
        </div>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const [session, setSession] = useState(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return
      setSession(data?.session ?? null)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return
      setSession(newSession)
    })

    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    setSigningOut(false)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-4 font-heading">Admin Dashboard</h1>

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#111] rounded-xl px-4 py-3">
          <p className="text-sm text-neutral-400 font-body truncate pr-3">
            {session?.user?.email ? session.user.email : 'Not signed in'}
          </p>
          {session?.user ? (
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="px-3 py-1 text-xs rounded-md bg-neutral-800 text-white disabled:opacity-60"
            >
              Sign out
            </button>
          ) : (
            <Link to="/signin" className="px-3 py-1 text-xs rounded-md bg-neutral-800 text-white">
              Sign in
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ActionTile to="/admin/import" title="TMDB Import" description="Import movies" Icon={DownloadIcon} />
          <ActionTile to="/admin/add-movie" title="Movies Manager" description="Add or edit movies" Icon={FilmIcon} />
          <ActionTile to="/admin/media" title="Media Manager" description="Manage media" Icon={ImageIcon} />
          <ActionTile to="/admin/add-person" title="Persons" description="Add people" Icon={UserIcon} />
          <ActionTile to="/admin/homepage-sections" title="Homepage Sections" description="Manage collections" Icon={LayoutIcon} />
        </div>
      </div>
    </div>
  )
}

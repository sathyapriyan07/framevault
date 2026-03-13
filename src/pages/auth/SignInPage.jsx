import { useEffect, useState } from 'react'
import AuthPanel from '../../components/ui/AuthPanel'
import { supabase } from '../../services/supabaseClient'
import { Link } from 'react-router-dom'

export default function SignInPage() {
  const [role, setRole] = useState(null)
  const [email, setEmail] = useState('')
  const [loadingRole, setLoadingRole] = useState(true)

  const loadRole = async () => {
    setLoadingRole(true)
    const { data } = await supabase.auth.getSession()
    const userId = data?.session?.user?.id
    const userEmail = data?.session?.user?.email || ''
    setEmail(userEmail)
    if (!userId) {
      setRole(null)
      setLoadingRole(false)
      return
    }
    const { data: roleData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    setRole(roleData?.role ?? null)
    setLoadingRole(false)
  }

  useEffect(() => {
    loadRole()
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadRole()
    })
    return () => listener?.subscription?.unsubscribe()
  }, [])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-heading font-bold mb-6 text-center">Sign In</h1>
        <AuthPanel />
        <div className="mt-6 rounded-2xl bg-dark-card p-4 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span>{email ? `Signed in as ${email}` : 'Not signed in'}</span>
            <button
              onClick={loadRole}
              className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
            >
              Refresh Role
            </button>
          </div>
          <div className="mt-2">
            {loadingRole ? 'Checking role...' : `Role: ${role || 'user'}`}
          </div>
          {role === 'admin' && (
            <div className="mt-3">
              <Link to="/admin" className="rounded-full bg-[#ff375f] px-4 py-2 text-xs text-white">
                Go to Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

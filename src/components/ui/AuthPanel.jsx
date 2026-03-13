import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'

export default function AuthPanel({ onAuthChange }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [session, setSession] = useState(null)

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setSession(data?.session ?? null)
        onAuthChange?.(data?.session ?? null)
      }
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession)
        onAuthChange?.(newSession)
      }
    })

    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [onAuthChange])

  const createProfileRow = async (user) => {
    if (!user) return
    await supabase.from('users').upsert({ id: user.id, email: user.email, role: 'user' }, { onConflict: 'id' })
  }

  const handleSignIn = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessageType('error')
      setMessage(error.message)
    } else {
      setMessageType('success')
      setMessage('Signed in successfully.')
      await createProfileRow(data?.user)
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessageType('error')
      setMessage(error.message)
    } else {
      setMessageType('success')
      setMessage('Account created. Check your email if confirmation is required.')
      await createProfileRow(data?.user)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
  }

  return (
    <div className="bg-dark-card p-6 rounded-2xl shadow-2xl">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-heading font-semibold">Admin Auth</h2>
        {session?.user && (
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 transition"
            disabled={loading}
          >
            Sign out
          </button>
        )}
      </div>

      {session?.user ? (
        <p className="text-sm text-gray-300">
          Signed in as <span className="text-white">{session.user.email}</span>
        </p>
      ) : (
        <>
          <div className="grid gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff375f]/60"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff375f]/60"
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-[#ff375f] hover:bg-[#ff5c7a] px-6 py-2 rounded-full disabled:opacity-50"
            >
              Sign in
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full disabled:opacity-50"
            >
              Sign up
            </button>
          </div>
        </>
      )}

      {message && (
        <p className={`mt-4 text-sm ${messageType === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

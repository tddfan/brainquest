import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { AVATARS } from '../data/questions'
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters.')
      return
    }
    setLoading(true)
    try {
      await register(email, password, username.trim(), avatarIndex)
      navigate('/')
    } catch (err) {
      console.error('Registration error:', err.code, err.message)
      if (err.code === 'auth/email-already-in-use') {
        setError('That email is already registered. Try logging in.')
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.')
      } else if (err.code === 'auth/invalid-api-key' || err.code === 'auth/configuration-not-found') {
        setError('Firebase config error. Check your .env file values.')
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Check your internet connection.')
      } else {
        setError(`Error: ${err.code ?? err.message}`)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="glass card max-w-md w-full py-10"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🚀</div>
          <p className="text-violet-400 font-black tracking-widest text-sm uppercase mb-1">BrainQuest</p>
          <h1 className="text-3xl font-black">Join the Squad!</h1>
          <p className="text-gray-400 mt-1">Create your explorer profile</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-2xl px-4 py-3 mb-5 text-red-400 text-sm font-semibold">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Avatar picker */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-400 mb-3">Choose your avatar</p>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((av, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAvatarIndex(i)}
                className={`text-2xl p-2 rounded-xl transition-all ${avatarIndex === i ? 'bg-violet-600 scale-110 shadow-lg shadow-violet-500/40' : 'bg-white/5 hover:bg-white/10'}`}
              >
                {av}
              </button>
            ))}
          </div>
          <div className="text-center mt-2 text-3xl">{AVATARS[avatarIndex]}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-400 mb-1.5 block">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="CoolExplorer42"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-400 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-400 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            {password.length > 0 && (
              <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-semibold ${password.length >= 6 ? 'text-green-400' : 'text-red-400'}`}>
                <CheckCircle2 size={12} />
                {password.length >= 6 ? 'Strong enough!' : 'At least 6 characters needed'}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center py-4 text-lg mt-2"
          >
            {loading ? '⏳ Creating account…' : 'Start Exploring! 🚀'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already a member?{' '}
          <Link to="/login" className="text-violet-400 font-bold hover:text-violet-300 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

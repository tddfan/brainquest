import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { User, Lock, AlertCircle, Target, Flame, Trophy, Puzzle } from 'lucide-react'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(identifier, password)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sneak Peek / Landing Side */}
      <div className="lg:w-1/2 p-8 lg:p-20 flex flex-col justify-center relative overflow-hidden order-2 lg:order-1">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-blue-600/20 -z-10" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 blur-[120px] rounded-full" />
        
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Join 1,000+ Explorers</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[0.9] tracking-tighter uppercase">
            Where Learning <br/>
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Meets Legend.</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-lg leading-relaxed font-medium">
            BrainQuest transforms standard education into a massive multiplayer RPG. Master your skills, defeat monsters, and earn legendary rewards.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Target className="text-blue-400" size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider mb-1">Epic Quests</h4>
                <p className="text-xs text-gray-500 leading-normal">Maths & English challenges designed for your age.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                <Flame className="text-red-400" size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider mb-1">World Bosses</h4>
                <p className="text-xs text-gray-500 leading-normal">Team up with others to defeat the Knowledge Monster.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                <Trophy className="text-yellow-400" size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider mb-1">Collect Pets</h4>
                <p className="text-xs text-gray-500 leading-normal">Hatch mystery eggs and collect ultra-rare pets.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Puzzle className="text-purple-400" size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider mb-1">Daily Puzzles</h4>
                <p className="text-xs text-gray-500 leading-normal">Chess, Sudoku, Wordle and more to sharpen your mind.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Login Side */}
      <div className="lg:w-1/2 p-8 lg:p-20 flex items-center justify-center order-1 lg:order-2">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.3, delay: 0.2 }}
          className="glass card max-w-md w-full py-12 px-10 border-white/10"
        >
          <div className="text-center mb-10">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Welcome Back</h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Your next quest awaits</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-2xl px-4 py-3 mb-6 text-red-400 text-sm font-semibold">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block ml-1">Email or Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or username"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block ml-1">Secret Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-5 rounded-2xl text-lg uppercase tracking-widest transition-all shadow-xl shadow-violet-600/20 active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? '⏳ Accessing Vault...' : 'Enter the Arena →'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-10 text-sm font-bold uppercase tracking-wide">
            New explorer?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 transition-colors underline decoration-2 underline-offset-4">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

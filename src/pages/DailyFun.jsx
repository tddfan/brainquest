import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Smile, HelpCircle, Zap } from 'lucide-react'
import { JOKES, RIDDLES, PARADOXES } from '../data/funStuff'

export default function DailyFun() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('jokes')
  const [item, setItem] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const getRandom = (type) => {
    setRevealed(false)
    const list = type === 'jokes' ? JOKES : type === 'riddles' ? RIDDLES : PARADOXES
    const rand = list[Math.floor(Math.random() * list.length)]
    setItem(rand)
  }

  useEffect(() => {
    getRandom(tab)
  }, [tab])

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-bold text-sm">Dashboard</span>
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Daily Fun</h1>
          <p className="text-gray-400">Jokes, Riddles & Mind-bending Paradoxes</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
          {['jokes', 'riddles', 'paradoxes'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 rounded-xl font-bold capitalize transition-all ${tab === t ? 'bg-violet-600 shadow-lg shadow-violet-600/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab + (item?.q || item?.title)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass card p-8 text-center min-h-[300px] flex flex-col justify-center items-center relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-gray-800 pointer-events-none">
              {tab === 'jokes' && <Smile size={80} />}
              {tab === 'riddles' && <HelpCircle size={80} />}
              {tab === 'paradoxes' && <Zap size={80} />}
            </div>

            {item && (
              <>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 relative z-10">
                  {tab === 'paradoxes' ? item.title : item.q}
                </h2>

                {tab !== 'paradoxes' ? (
                  <button 
                    onClick={() => setRevealed(true)}
                    className={`text-xl font-black transition-all ${revealed ? 'text-green-400' : 'text-transparent bg-white/10 rounded-lg px-8 py-2 cursor-pointer hover:bg-white/20'}`}
                  >
                    {revealed ? item.a : 'Tap to reveal answer'}
                  </button>
                ) : (
                  <p className="text-gray-300 text-lg leading-relaxed">{item.desc}</p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <button 
          onClick={() => getRandom(tab)}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold text-gray-300 transition-all border border-white/5"
        >
          <RefreshCw size={18} />
          Show another one
        </button>

      </div>
    </div>
  )
}

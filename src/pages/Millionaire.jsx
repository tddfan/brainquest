import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Users, Phone, Zap, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { FALLBACK_MILLIONAIRE_QUESTIONS } from '../data/millionaireQuestions'
import { useSound } from '../hooks/useSound'

const XP_LEVELS = [
  100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000
]
const SAFETY_NETS = [0, 0, 0, 0, 1000, 1000, 1000, 1000, 1000, 32000, 32000, 32000, 32000, 32000, 32000]

// Real game difficulty mapping
const GET_DIFFICULTY = (level) => {
  if (level < 5) return 'easy'
  if (level < 10) return 'medium'
  return 'hard'
}

export default function Millionaire() {
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile } = useAuth()
  const { playSound } = useSound()

  const [level, setLevel] = useState(0) // 0 to 14
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [phase, setPhase] = useState('playing') // 'playing' | 'feedback' | 'lost' | 'won' | 'walked'
  const [selected, setSelected] = useState(null)
  const [lifelines, setLifelines] = useState({ fiftyFifty: true, audience: true, phone: true })
  const [activeLifeline, setActiveLifeline] = useState(null)
  const [hiddenOptions, setHiddenOptions] = useState([])
  const [audienceData, setAudienceData] = useState(null)
  const [phoneMessage, setPhoneMessage] = useState(null)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const diffs = ['easy', 'medium', 'hard']
      const batchSize = 5
      const decode = (s) => {
        try {
          return atob(s)
        } catch {
          return s
        }
      }

      const results = await Promise.all(diffs.map(async (diff) => {
        const res = await fetch(`https://opentdb.com/api.php?amount=${batchSize}&difficulty=${diff}&type=multiple&encode=base64`)
        const data = await res.json()
        if (data.response_code !== 0) throw new Error('API Error')
        return data.results.map(q => {
          const correct = decode(q.correct_answer)
          const opts = [correct, ...q.incorrect_answers.map(decode)].sort(() => Math.random() - 0.5)
          return {
            question: decode(q.question),
            options: opts,
            correct: opts.indexOf(correct),
            difficulty: diff
          }
        })
      }))

      // Flatten the 3 batches of 5 into one array of 15
      const allQs = [...results[0], ...results[1], ...results[2]].map((q, i) => ({ ...q, id: i }))
      
      setQuestions(allQs)
      setLoading(false)
    } catch (err) {
      console.error('Fetch error:', err)
      // If API fails, pick 5 random questions from each difficulty in the fallback pool
      const getFallbacks = (diff, count) => {
        return FALLBACK_MILLIONAIRE_QUESTIONS
          .filter(q => q.difficulty === diff)
          .sort(() => Math.random() - 0.5)
          .slice(0, count)
      }

      const allFallbacks = [
        ...getFallbacks('easy', 5),
        ...getFallbacks('medium', 5),
        ...getFallbacks('hard', 5)
      ].map((q, i) => ({ ...q, id: i }))

      setQuestions(allFallbacks)
      setLoading(false)
    }
  }, [])

  // Fetch all 15 questions upfront to ensure smooth play
  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const resetGame = () => {
    setLevel(0)
    setPhase('playing')
    setSelected(null)
    setLifelines({ fiftyFifty: true, audience: true, phone: true })
    setActiveLifeline(null)
    setHiddenOptions([])
    setAudienceData(null)
    setPhoneMessage(null)
    fetchQuestions()
  }

  const handleAnswer = (idx) => {
    if (phase !== 'playing' || hiddenOptions.includes(idx)) return
    setSelected(idx)
    setPhase('feedback')
    playSound('click')

    const isCorrect = idx === questions[level].correct

    setTimeout(async () => {
      if (isCorrect) {
        playSound('correct')
        if (level === 14) {
          setPhase('won')
          await saveXP(XP_LEVELS[14])
        } else {
          // Move to next level after a delay
          setTimeout(() => {
            setLevel(level + 1)
            setSelected(null)
            setPhase('playing')
            setHiddenOptions([])
            setActiveLifeline(null)
            setAudienceData(null)
            setPhoneMessage(null)
          }, 1500)
        }
      } else {
        playSound('wrong')
        setPhase('lost')
        const prize = level > 0 ? SAFETY_NETS[level - 1] : 0
        await saveXP(prize)
      }
    }, 2000)
  }

  const saveXP = async (amount) => {
    if (amount <= 0) return
    // Scale XP for game balance (e.g., 1,000,000 in-game = 1,000 real XP)
    const realXP = Math.floor(amount / 100) 
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        totalXP: increment(realXP),
      })
      setUserProfile(prev => ({ ...prev, totalXP: (prev?.totalXP ?? 0) + realXP }))
    } catch (e) {
      console.error('Error saving Millionaire XP:', e)
    }
  }

  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || phase !== 'playing') return
    playSound('click')
    const q = questions[level]
    const wrongIndices = q.options.map((_, i) => i).filter(i => i !== q.correct)
    const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2)
    setHiddenOptions(toHide)
    setLifelines(prev => ({ ...prev, fiftyFifty: false }))
  }

  const useAudience = () => {
    if (!lifelines.audience || phase !== 'playing') return
    playSound('click')
    const q = questions[level]
    const data = [0, 0, 0, 0]
    let remaining = 100
    
    // Give correct answer a higher probability based on difficulty
    const weight = q.difficulty === 'easy' ? 70 : q.difficulty === 'medium' ? 50 : 35
    data[q.correct] = weight
    remaining -= weight

    for(let i=0; i<4; i++) {
      if(i === q.correct) continue
      const val = Math.floor(Math.random() * remaining)
      data[i] = val
      remaining -= val
    }
    data[3] += remaining // dump remainder

    setAudienceData(data)
    setLifelines(prev => ({ ...prev, audience: false }))
    setActiveLifeline('audience')
  }

  const usePhone = () => {
    if (!lifelines.phone || phase !== 'playing') return
    playSound('click')
    const q = questions[level]
    const isCorrect = Math.random() > (q.difficulty === 'easy' ? 0.1 : q.difficulty === 'medium' ? 0.3 : 0.6)
    const answer = isCorrect ? q.options[q.correct] : q.options[Math.floor(Math.random() * 4)]
    
    setPhoneMessage(`"I'm about ${isCorrect ? '90' : '40'}% sure the answer is ${answer}."`)
    setLifelines(prev => ({ ...prev, phone: false }))
    setActiveLifeline('phone')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 font-bold">Loading the Money Ladder...</p>
      </div>
    </div>
  )

  const q = questions[level]

  return (
    <div className="min-h-screen bg-[#020230] text-white p-4 font-sans selection:bg-violet-500">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-4">
        
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft />
            </button>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              XP MILLIONAIRE
            </div>
            <div className="flex gap-2">
              <LifelineButton icon={<HelpCircle size={20}/>} active={lifelines.fiftyFifty} onClick={useFiftyFifty} label="50:50" />
              <LifelineButton icon={<Users size={20}/>} active={lifelines.audience} onClick={useAudience} label="Audience" />
              <LifelineButton icon={<Phone size={20}/>} active={lifelines.phone} onClick={usePhone} label="Phone" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
            <AnimatePresence mode="wait">
              <motion.div 
                key={level}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                {/* Lifeline Displays */}
                {audienceData && (
                  <div className="flex justify-center gap-4 mb-8 bg-black/40 p-4 rounded-2xl border border-white/10">
                    {audienceData.map((val, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-8 bg-blue-500 rounded-t" style={{ height: val * 1.5 }}></div>
                        <span className="text-[10px] font-bold">{String.fromCharCode(65+i)}</span>
                        <span className="text-[10px] text-blue-400">{val}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {phoneMessage && (
                  <div className="mb-8 bg-blue-900/40 p-4 rounded-2xl border border-blue-500/30 text-blue-100 italic">
                    {phoneMessage}
                  </div>
                )}

                <div className="relative mb-12">
                   <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full"></div>
                   <h2 className="text-2xl md:text-3xl font-bold relative z-10 leading-tight">
                    {q.question}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto">
                  {q.options.map((opt, i) => {
                    const isHidden = hiddenOptions.includes(i)
                    const isSelected = selected === i
                    const isCorrect = i === q.correct
                    
                    let stateClass = "bg-blue-900/30 border-blue-800 hover:border-blue-400"
                    if (phase === 'feedback') {
                      if (isSelected) stateClass = isCorrect ? "bg-green-600 border-green-400 animate-pulse" : "bg-red-600 border-red-400"
                      else if (isCorrect) stateClass = "bg-green-600 border-green-400"
                    } else if (isSelected) {
                      stateClass = "bg-orange-500 border-orange-300"
                    }

                    if (isHidden) return <div key={i} className="h-16"></div>

                    return (
                      <button
                        key={i}
                        disabled={phase !== 'playing'}
                        onClick={() => handleAnswer(i)}
                        className={`group relative h-16 flex items-center px-8 border-2 rounded-full transition-all duration-300 ${stateClass}`}
                      >
                        <span className="text-orange-500 font-black mr-4 group-hover:text-white transition-colors">
                          {String.fromCharCode(65 + i)}:
                        </span>
                        <span className="font-bold text-lg truncate">{opt}</span>
                        <div className="absolute inset-y-0 -left-4 w-4 bg-inherit border-y-2 border-l-2 border-inherit rounded-l-full hidden md:block"></div>
                        <div className="absolute inset-y-0 -right-4 w-4 bg-inherit border-y-2 border-r-2 border-inherit rounded-r-full hidden md:block"></div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Game States */}
          <AnimatePresence>
            {phase === 'lost' && (
              <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-blue-900 border-2 border-blue-400 p-10 rounded-3xl text-center max-w-sm">
                  <h3 className="text-4xl font-black mb-4">GAME OVER</h3>
                  <p className="text-gray-300 mb-6">You are walking away with</p>
                  <div className="text-5xl font-black text-yellow-400 mb-8">{SAFETY_NETS[level > 0 ? level-1 : 0].toLocaleString()} XP</div>
                  <button onClick={resetGame} className="w-full bg-white text-blue-900 font-black py-4 rounded-xl hover:bg-yellow-400 transition-colors">TRY AGAIN</button>
                  <button onClick={() => navigate('/')} className="w-full mt-4 text-white/50 font-bold py-2">EXIT</button>
                </div>
              </motion.div>
            )}
            {phase === 'won' && (
              <motion.div initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} className="fixed inset-0 bg-yellow-500/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-[#020230] border-4 border-yellow-400 p-12 rounded-[3rem] text-center max-w-lg shadow-[0_0_50px_rgba(250,204,21,0.3)]">
                  <div className="text-7xl mb-6">🏆</div>
                  <h3 className="text-5xl font-black mb-4 text-yellow-400">XP MILLIONAIRE!</h3>
                  <p className="text-blue-100 text-xl mb-10">You've reached the top of the ladder and earned the ultimate prize.</p>
                  <div className="text-6xl font-black mb-12">1,000,000 <span className="text-2xl text-yellow-400">XP</span></div>
                  <button onClick={() => navigate('/')} className="w-full bg-yellow-400 text-blue-900 font-black py-5 rounded-2xl text-xl hover:scale-105 transition-transform">COLLECT PRIZE</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Money Ladder Side Panel */}
        <div className="w-full lg:w-72 bg-blue-950/50 rounded-3xl p-6 border border-white/5 hidden md:block">
          <div className="flex flex-col-reverse gap-1">
            {XP_LEVELS.map((amount, i) => {
              const isSafety = i === 4 || i === 9 || i === 14
              const isActive = level === i
              const isPassed = level > i
              return (
                <div 
                  key={i} 
                  className={`flex items-center gap-4 px-4 py-2 rounded-lg font-bold transition-colors ${
                    isActive ? 'bg-orange-500 text-white scale-105 shadow-lg' : 
                    isPassed ? 'text-orange-400/50' : 
                    isSafety ? 'text-white' : 'text-orange-400'
                  }`}
                >
                  <span className="w-6 text-right text-xs opacity-50">{i + 1}</span>
                  <span className="flex-1 text-lg">{amount.toLocaleString()}</span>
                  {isSafety && <Zap size={14} className="text-yellow-400" />}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

function LifelineButton({ icon, active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      disabled={!active}
      className={`group relative flex flex-col items-center gap-1 ${!active ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-110' } transition-all`}
    >
      <div className={`p-3 rounded-full border-2 ${active ? 'border-blue-400 bg-blue-900/50' : 'border-white/10'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  )
}

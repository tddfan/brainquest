import { useState } from 'react'
import { ACHIEVEMENTS } from '../../data/achievements'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Info, CheckCircle2 } from 'lucide-react'

export default function BadgeGrid({ userStats }) {
  const [selectedBadge, setSelectedBadge] = useState(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = ach.requirement(userStats)
          return (
            <motion.div
              key={ach.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedBadge(ach)}
              className={`relative p-5 rounded-3xl border-2 text-center transition-all cursor-pointer group ${
                isUnlocked 
                  ? 'bg-gradient-to-br from-violet-600/20 to-pink-600/20 border-violet-500/40 shadow-lg shadow-violet-500/5' 
                  : 'bg-white/5 border-white/5 grayscale hover:grayscale-0 transition-all'
              }`}
            >
              <div className={`text-5xl mb-3 transition-transform group-hover:scale-110 ${!isUnlocked ? 'opacity-40' : ''}`}>
                {ach.emoji}
              </div>
              <h5 className={`text-[11px] font-black uppercase tracking-wider ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                {ach.title}
              </h5>
              
              {isUnlocked ? (
                <div className="absolute top-2 right-2 text-green-400">
                  <CheckCircle2 size={14} fill="currentColor" className="text-gray-900" />
                </div>
              ) : (
                <div className="absolute top-2 right-2 text-gray-600">
                  <Lock size={12} />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedBadge(null)} 
              className="fixed inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass card max-w-sm w-full p-8 text-center relative z-[120] border-2 border-white/10"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBadge(null);
                }}
                className="absolute top-2 right-2 p-4 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors z-[130]"
                aria-label="Close modal"
              >
                <X size={24} strokeWidth={3} />
              </button>

              <div className={`text-8xl mb-6 filter drop-shadow-2xl ${!selectedBadge.requirement(userStats) ? 'grayscale' : ''}`}>
                {selectedBadge.emoji}
              </div>
              
              <h3 className="text-2xl font-black mb-2">{selectedBadge.title}</h3>
              <p className="text-violet-400 font-bold text-sm mb-6 px-4">
                {selectedBadge.description}
              </p>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 justify-center mb-2 text-gray-400">
                  <Info size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">How to get it</span>
                </div>
                <p className="text-sm text-gray-300 font-medium">
                  {getRequirementText(selectedBadge)}
                </p>
              </div>

              {selectedBadge.requirement(userStats) ? (
                <div className="mt-8 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-black text-sm">
                  UNLOCKED! 🎉
                </div>
              ) : (
                <div className="mt-8 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 font-black text-sm flex items-center justify-center gap-2">
                  <Lock size={14} /> LOCKED
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function getRequirementText(ach) {
  // Map internal logic to human-friendly text
  switch(ach.id) {
    case 'first_win': return 'Finish your very first quiz session.';
    case 'quiz_master': return 'Complete a total of 10 quizzes.';
    case 'xp_1000': return 'Earn 1,000 XP through quizzes and puzzles.';
    case 'streak_3': return 'Get a streak of 3 correct answers in one quiz.';
    case 'speed_demon': return 'Earn a speed bonus by answering in under 10 seconds.';
    default: return ach.description;
  }
}

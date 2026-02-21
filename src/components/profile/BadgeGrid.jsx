import { ACHIEVEMENTS } from '../../data/achievements'
import { motion } from 'framer-motion'

export default function BadgeGrid({ userStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {ACHIEVEMENTS.map((ach) => {
        const isUnlocked = ach.requirement(userStats)
        return (
          <motion.div
            key={ach.id}
            whileHover={isUnlocked ? { scale: 1.05 } : {}}
            className={`relative p-4 rounded-3xl border-2 text-center transition-all ${
              isUnlocked 
                ? 'bg-gradient-to-br from-violet-600/20 to-pink-600/20 border-violet-500/50 shadow-lg shadow-violet-500/10' 
                : 'bg-white/5 border-white/5 grayscale opacity-40'
            }`}
          >
            <div className="text-4xl mb-2">{ach.emoji}</div>
            <h5 className={`text-xs font-black uppercase tracking-tighter ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
              {ach.title}
            </h5>
            <div className="mt-1 text-[10px] text-gray-400 leading-tight">
              {ach.description}
            </div>
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl">
                <span className="text-xs">🔒</span>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Smile, HelpCircle, Zap, Lock, Newspaper, ExternalLink, Loader, Rocket, Globe, Trophy } from 'lucide-react'
import { JOKES, RIDDLES, PARADOXES } from '../data/funStuff'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../hooks/useSound'

// High-quality, safe, child-friendly feeds
const FEEDS = {
  world:  'https://feeds.bbci.co.uk/cbbc/newsround/rss.xml',
  sports: 'https://feeds.bbci.co.uk/cbbc/newsround/sport/rss.xml',
  space:  'https://www.nasa.gov/news-release/feed/',
}

function todayKey(type) {
  return `news_${type}_${new Date().toDateString()}`
}

function parseRSSXML(xmlText) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')
    const items = [...doc.querySelectorAll('item')].slice(0, 15)
    return items.map(item => {
      const getText = tag => item.getElementsByTagName(tag)[0]?.textContent?.trim() || ''
      
      let thumbnail = null
      const mediaContent = item.getElementsByTagName('media:content')[0]
      if (mediaContent) thumbnail = mediaContent.getAttribute('url')
      
      const mediaThumbnail = item.getElementsByTagName('media:thumbnail')[0]
      if (!thumbnail && mediaThumbnail) thumbnail = mediaThumbnail.getAttribute('url')
      
      const enclosure = item.getElementsByTagName('enclosure')[0]
      if (!thumbnail && enclosure) thumbnail = enclosure.getAttribute('url')

      const rawDesc = getText('description').replace(/<[^>]*>/g, '').trim()
      return {
        title:       getText('title'),
        link:        getText('link'),
        description: rawDesc.slice(0, 180),
        thumbnail,
        date: getText('pubDate')
          ? new Date(getText('pubDate')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
          : '',
      }
    }).filter(i => i.title)
  } catch (e) {
    console.error("XML Parse error:", e)
    return []
  }
}

async function fetchNews(type) {
  const cacheKey = todayKey(type)
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (parsed?.length > 0) return parsed
    } catch { localStorage.removeItem(cacheKey) }
  }

  const feedUrl = FEEDS[type] || FEEDS.world
  
  // Try multiple proxies to ensure connection
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`
  ]

  for (const proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl)
      if (res.ok) {
        const text = await res.text()
        const items = parseRSSXML(text)
        if (items && items.length > 0) {
          localStorage.setItem(cacheKey, JSON.stringify(items))
          return items
        }
      }
    } catch (e) {
      console.warn("Proxy attempt failed:", proxyUrl, e)
    }
  }

  // Backup: rss2json
  try {
    const res2 = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
    const data = await res2.json()
    if (data.status === 'ok') {
      const items = data.items.map(item => ({
        title:       item.title,
        link:        item.link,
        description: (item.description || '').replace(/<[^>]*>/g, '').trim().slice(0, 180),
        thumbnail:   item.thumbnail || item.enclosure?.link || null,
        date:        item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '',
      })).filter(i => i.title)
      if (items.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(items))
        return items
      }
    }
  } catch (e) {
    console.error("All news fetch methods failed", e)
  }
  
  return []
}

const TABS = [
  { id: 'jokes',     label: 'Jokes',     Icon: Smile },
  { id: 'riddles',   label: 'Riddles',   Icon: HelpCircle },
  { id: 'paradoxes', label: 'Paradoxes', Icon: Zap },
  { id: 'news',      label: 'News',      Icon: Newspaper },
]

const VALID_TABS = ['jokes', 'riddles', 'paradoxes', 'news']

export default function DailyFun() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isGuest } = useAuth()
  const { playSound } = useSound()

  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab')
    return VALID_TABS.includes(t) ? t : 'jokes'
  })

  useEffect(() => {
    const t = searchParams.get('tab')
    if (VALID_TABS.includes(t)) setTab(t)
  }, [searchParams])
  
  const [item, setItem] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const [newsType, setNewsType] = useState('world')
  const [newsItems, setNewsItems] = useState([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState(false)

  useEffect(() => {
    if (isGuest && tab !== 'jokes') setTab('jokes')
  }, [isGuest, tab])

  function getRandom(type) {
    setRevealed(false)
    const list = type === 'jokes' ? JOKES : type === 'riddles' ? RIDDLES : PARADOXES
    if (!list || list.length === 0) return
    setItem(list[Math.floor(Math.random() * list.length)])
  }

  useEffect(() => {
    if (tab !== 'news') getRandom(tab)
  }, [tab])

  const handleFetchNews = (type) => {
    setNewsLoading(true)
    setNewsError(false)
    fetchNews(type)
      .then(items => {
        if (items && items.length > 0) {
          setNewsItems(items)
          setNewsError(false)
        } else {
          setNewsError(true)
        }
        setNewsLoading(false)
      })
      .catch(err => {
        console.error("News Load Error:", err)
        setNewsError(true)
        setNewsLoading(false)
      })
  }

  useEffect(() => {
    if (tab === 'news') handleFetchNews(newsType)
  }, [tab, newsType])

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-bold text-sm uppercase tracking-widest">Dashboard</span>
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent uppercase tracking-tighter">Daily Fun</h1>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Jokes · Riddles · World · Sports</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/10">
          {TABS.map(({ id, label, Icon }) => {
            const locked = isGuest && id !== 'jokes'
            return (
              <button
                key={id}
                onClick={() => {
                  if (locked) { playSound('wrong'); return }
                  setTab(id)
                }}
                className={`flex-1 py-3 rounded-xl font-black capitalize transition-all flex items-center justify-center gap-2 text-xs sm:text-sm ${
                  tab === id ? 'bg-violet-600 shadow-lg shadow-violet-600/20 text-white' : 'text-gray-500 hover:text-gray-300'
                } ${locked ? 'opacity-50' : ''}`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.slice(0, 4)}</span>
                {locked && <Lock size={10} />}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'news' ? (
            <motion.div key="news" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
              <div className="flex gap-2 mb-6 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                <button
                  onClick={() => setNewsType('world')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${newsType === 'world' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Globe size={14} /> World News
                </button>
                <button
                  onClick={() => setNewsType('sports')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${newsType === 'sports' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Trophy size={14} /> Sports News
                </button>
              </div>

              {newsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 font-bold text-sm animate-pulse uppercase tracking-widest">Reaching Satellites...</p>
                </div>
              ) : newsError ? (
                <div className="glass card p-10 text-center border-red-500/20">
                  <div className="text-6xl mb-4 opacity-50">📡</div>
                  <p className="text-gray-300 font-black text-xl mb-2 uppercase">Connection Problem</p>
                  <p className="text-gray-500 text-sm mb-6">We couldn&apos;t reach the news server. Try again in a moment.</p>
                  <button
                    onClick={() => handleFetchNews(newsType)}
                    className="bg-violet-600 px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform"
                  >
                    TRY AGAIN
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {newsItems.map((news, i) => (
                    <motion.a
                      key={i}
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass card p-4 flex gap-5 hover:bg-white/10 transition-all border border-white/5 active:scale-95 block group"
                    >
                      {news.thumbnail ? (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-xl bg-gray-900">
                          <img
                            src={news.thumbnail}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 text-3xl grayscale opacity-20">
                          {newsType === 'world' ? '🌍' : '🏆'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-black text-base leading-tight mb-2 group-hover:text-violet-300 transition-colors line-clamp-2">
                          {news.title}
                        </h3>
                        {news.description && (
                          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 font-medium">{news.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-gray-600">
                          <span className="bg-white/10 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{news.date || 'Today'}</span>
                          <ExternalLink size={10} className="group-hover:text-violet-400" />
                        </div>
                      </div>
                    </motion.a>
                  ))}
                  <p className="text-center text-gray-700 text-[10px] font-black uppercase tracking-[0.2em] mt-8 pb-4">
                    Refreshed Daily · Kid-Friendly Content
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={tab + (item?.q || item?.title)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass card p-10 text-center min-h-[350px] flex flex-col justify-center items-center relative overflow-hidden border-2 border-white/5"
            >
              <div className="absolute -top-10 -right-10 text-white/5 pointer-events-none rotate-12">
                {tab === 'jokes'     && <Smile       size={200} />}
                {tab === 'riddles'   && <HelpCircle  size={200} />}
                {tab === 'paradoxes' && <Zap         size={200} />}
              </div>

              {item && (
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-black mb-10 leading-tight tracking-tight px-2">
                    {tab === 'paradoxes' ? item.title : item.q}
                  </h2>

                  {tab !== 'paradoxes' ? (
                    <button
                      onClick={() => { if (!revealed) playSound('achievement'); setRevealed(true) }}
                      className={`w-full max-w-xs mx-auto py-4 rounded-2xl text-xl font-black transition-all border-2 ${
                        revealed
                          ? 'text-green-400 border-green-500/50 bg-green-500/10'
                          : 'text-white/20 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white/40 cursor-pointer'
                      }`}
                    >
                      {revealed ? item.a : 'REVEAL ANSWER'}
                    </button>
                  ) : (
                    <p className="text-gray-300 text-lg leading-relaxed font-medium bg-white/5 p-6 rounded-3xl border border-white/5 italic">
                      &ldquo;{item.desc}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {tab !== 'news' && (
          <button
            onClick={() => { playSound('click'); getRandom(tab) }}
            className="mt-8 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600/20 to-pink-600/20 hover:from-violet-600/30 hover:to-pink-600/30 py-5 rounded-3xl font-black text-white uppercase tracking-widest transition-all border border-white/10 active:scale-95 shadow-xl"
          >
            <RefreshCw size={20} />
            Another One!
          </button>
        )}

      </div>
    </div>
  )
}

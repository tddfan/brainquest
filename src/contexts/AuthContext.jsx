import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const LOGIN_TIMESTAMP_KEY = 'loginTimestamp'
const GUEST_STORAGE_KEY = 'brainquest_guest_data'

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)

  const GUEST_PROFILE = {
    uid: 'guest',
    username: 'Guest Explorer',
    avatarIndex: 0,
    unlockedAvatars: [0],
    totalXP: 0,
    diamonds: 0,
    activeBoosts: { xp: 0, diamonds: 0 },
    level: 1,
    currentStreak: 0,
    lastLoginDate: null,
    title: 'Novice Explorer',
    quizzesCompleted: 0,
    puzzlesCompleted: 0,
    isGuest: true
  }

  async function register(identifier, password, avatarIndex) {
    let email = identifier.trim()
    let username = identifier.trim()

    if (!email.includes('@')) {
      // If it's a username, check if it's already taken in Firestore
      const snap = await getDocs(query(collection(db, 'users'), where('username', '==', username)))
      if (!snap.empty) throw new Error('Username already taken')
      email = `${username.toLowerCase()}@brainquest.app`
    } else {
      // If it's an email, extract username or use email as username if needed
      username = email.split('@')[0]
    }

    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString())
    
    const profile = {
      uid: user.uid,
      email,
      username,
      username_low: username.toLowerCase(),
      avatarIndex,
      unlockedAvatars: [avatarIndex],
      totalXP: 0,
      diamonds: 0,
      activeBoosts: { xp: 0, diamonds: 0 },
      level: 1,
      currentStreak: 1,
      lastLoginDate: new Date(),
      title: 'Quest Newbie',
      quizzesCompleted: 0,
      puzzlesCompleted: 0,
      dailyQuizzesCount: 0,
      lastDailyUpdate: new Date(),
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', user.uid), profile)
    
    setIsGuest(false)
    setCurrentUser(user)
    setUserProfile(profile)
    return user
  }

  async function login(identifier, password) {
    let email = identifier.trim()
    if (!email.includes('@')) {
      // If it's a username, check if it exists in Firestore first to get the correct email mapping
      const snap = await getDocs(query(collection(db, 'users'), where('username', '==', identifier.trim())))
      if (snap.empty) {
        // Try the default dummy email format if not found explicitly by username
        email = `${identifier.trim().toLowerCase()}@brainquest.app`
      } else {
        email = snap.docs[0].data().email
      }
    }
    const result = await signInWithEmailAndPassword(auth, email, password)
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString())
    
    const profileSnap = await getDoc(doc(db, 'users', result.user.uid))
    if (profileSnap.exists()) {
      setUserProfile(profileSnap.data())
      setIsGuest(false)
      setCurrentUser(result.user)
    }
    return result
  }

  function continueAsGuest() {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY)
    const profile = stored ? JSON.parse(stored) : { ...GUEST_PROFILE, lastDailyUpdate: new Date() }
    setUserProfile(profile)
    setIsGuest(true)
    setCurrentUser(null)
    return profile
  }

  async function logout() {
    await signOut(auth)
    localStorage.removeItem(LOGIN_TIMESTAMP_KEY)
    localStorage.removeItem(GUEST_STORAGE_KEY)
    setUserProfile(null)
    setIsGuest(false)
    setCurrentUser(null)
  }

  async function fetchUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      setUserProfile(snap.data())
    }
  }

  // Update guest data in localStorage whenever profile changes
  useEffect(() => {
    if (isGuest && userProfile) {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(userProfile))
    }
  }, [userProfile, isGuest])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const loginTimestamp = localStorage.getItem(LOGIN_TIMESTAMP_KEY)
        if (loginTimestamp && Date.now() - parseInt(loginTimestamp) > THIRTY_DAYS_MS) {
          await signOut(auth)
          localStorage.removeItem(LOGIN_TIMESTAMP_KEY)
          setCurrentUser(null)
          setUserProfile(null)
          setLoading(false)
          return
        }
        setCurrentUser(user)
        setIsGuest(false)
        // Only fetch if profile doesn't exist (to avoid overwriting login/register explicit set)
        if (!userProfile) {
          const snap = await getDoc(doc(db, 'users', user.uid))
          if (snap.exists()) {
            const data = snap.data()
            
            // Streak Logic
            const lastLogin = data.lastLoginDate?.toDate ? data.lastLoginDate.toDate() : null
            const today = new Date()
            today.setHours(0,0,0,0)
            
            if (lastLogin) {
              lastLogin.setHours(0,0,0,0)
              const diffDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24))
              
              if (diffDays === 1) {
                // Consecutive day
                const newStreak = (data.currentStreak || 0) + 1
                await updateDoc(doc(db, 'users', user.uid), { currentStreak: newStreak, lastLoginDate: today })
                data.currentStreak = newStreak
              } else if (diffDays > 1) {
                // Streak broken
                await updateDoc(doc(db, 'users', user.uid), { currentStreak: 1, lastLoginDate: today })
                data.currentStreak = 1
              }
            } else {
              await updateDoc(doc(db, 'users', user.uid), { currentStreak: 1, lastLoginDate: today })
              data.currentStreak = 1
            }

            // Special Reward for AaravTheCreator
            if (data.username === 'AaravTheCreator' && !data.unlockedAvatars?.includes('pet_dolphin')) {
              await updateDoc(doc(db, 'users', user.uid), { unlockedAvatars: [...(data.unlockedAvatars || []), 'pet_dolphin'] })
              data.unlockedAvatars = [...(data.unlockedAvatars || []), 'pet_dolphin']
            }

            setUserProfile(data)
          }
        }
      } else {
        // If not logged in, check if they were a guest
        if (!isGuest) {
          const guestData = localStorage.getItem(GUEST_STORAGE_KEY)
          if (guestData) {
            setUserProfile(JSON.parse(guestData))
            setIsGuest(true)
          } else {
            setUserProfile(null)
          }
        }
        setCurrentUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [userProfile, isGuest])

  const value = {
    currentUser,
    userProfile,
    isGuest,
    setUserProfile,
    register,
    login,
    logout,
    continueAsGuest,
    fetchUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

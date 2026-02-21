import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
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
    level: 1,
    quizzesCompleted: 0,
    puzzlesCompleted: 0,
    isGuest: true
  }

  async function register(email, password, username, avatarIndex) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString())
    
    // Carry over guest XP if they have any
    const carryOverXP = isGuest ? (userProfile?.totalXP ?? 0) : 0
    
    const profile = {
      uid: user.uid,
      email,
      username,
      avatarIndex,
      unlockedAvatars: [avatarIndex],
      totalXP: carryOverXP,
      level: 1,
      quizzesCompleted: isGuest ? (userProfile?.quizzesCompleted ?? 0) : 0,
      puzzlesCompleted: isGuest ? (userProfile?.puzzlesCompleted ?? 0) : 0,
      dailyQuizzesCount: isGuest ? (userProfile?.dailyQuizzesCount ?? 0) : 0,
      lastDailyUpdate: new Date(),
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', user.uid), profile)
    
    localStorage.removeItem(GUEST_STORAGE_KEY)
    setIsGuest(false)
    setCurrentUser(user)
    setUserProfile(profile)
    return user
  }

  async function login(emailOrUsername, password) {
    let email = emailOrUsername.trim()
    if (!email.includes('@')) {
      const snap = await getDocs(query(collection(db, 'users'), where('username', '==', email)))
      if (snap.empty) throw new Error('No account found with that username')
      email = snap.docs[0].data().email
    }
    const result = await signInWithEmailAndPassword(auth, email, password)
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString())
    localStorage.removeItem(GUEST_STORAGE_KEY)
    
    const profileSnap = await getDoc(doc(db, 'users', result.user.uid))
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      setUserProfile(data)
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
            setUserProfile(snap.data())
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

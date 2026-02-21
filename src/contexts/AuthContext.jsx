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

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function register(email, password, username, avatarIndex) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString())
    const profile = {
      uid: user.uid,
      email,
      username,
      avatarIndex,
      unlockedAvatars: [avatarIndex], // Initial avatar is unlocked
      totalXP: 0,
      level: 1,
      quizzesCompleted: 0,
      puzzlesCompleted: 0,
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', user.uid), profile)
    setUserProfile(profile)
    return user
  }

  async function login(emailOrUsername, password) {
    let email = emailOrUsername.trim()
    if (!email.includes('@')) {
      // Treat input as username — look up the associated email in Firestore
      const snap = await getDocs(query(collection(db, 'users'), where('username', '==', email)))
      if (snap.empty) throw new Error('No account found with that username')
      email = snap.docs[0].data().email
    }
    const result = await signInWithEmailAndPassword(auth, email, password)
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString())
    return result
  }

  async function logout() {
    await signOut(auth)
    localStorage.removeItem(LOGIN_TIMESTAMP_KEY)
    setUserProfile(null)
  }

  async function fetchUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      setUserProfile(snap.data())
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const loginTimestamp = localStorage.getItem(LOGIN_TIMESTAMP_KEY)
        if (loginTimestamp && Date.now() - parseInt(loginTimestamp) > THIRTY_DAYS_MS) {
          await signOut(auth)
          localStorage.removeItem(LOGIN_TIMESTAMP_KEY)
          setCurrentUser(null)
          setLoading(false)
          return
        }
        setCurrentUser(user)
        await fetchUserProfile(user.uid)
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    register,
    login,
    logout,
    fetchUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

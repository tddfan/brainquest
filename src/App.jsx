import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import QuizPage from './pages/QuizPage'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import SudokuPage from './pages/SudokuPage'
import CrosswordPage from './pages/CrosswordPage'
import WordlePage from './pages/WordlePage'
import HangmanPage from './pages/HangmanPage'
import ChessPage from './pages/ChessPage'
import Millionaire from './pages/Millionaire'
import DailyFun from './pages/DailyFun'
import Shop from './pages/Shop'
import MathsQuest from './pages/MathsQuest'
import EnglishQuest from './pages/EnglishQuest'
import MemoryGame from './pages/MemoryGame'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes but some allow Guests */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowGuest={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:category"
            element={
              <ProtectedRoute allowGuest={true}>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/puzzle/sudoku"
            element={
              <ProtectedRoute>
                <SudokuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/puzzle/crossword"
            element={
              <ProtectedRoute>
                <CrosswordPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/puzzle/wordle"
            element={
              <ProtectedRoute>
                <WordlePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/puzzle/hangman"
            element={
              <ProtectedRoute>
                <HangmanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/puzzle/chess"
            element={
              <ProtectedRoute allowGuest={true}>
                <ChessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/puzzle/millionaire"
            element={
              <ProtectedRoute>
                <Millionaire />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-fun"
            element={
              <ProtectedRoute allowGuest={true}>
                <DailyFun />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maths-quest"
            element={
              <ProtectedRoute>
                <MathsQuest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/english-quest"
            element={
              <ProtectedRoute>
                <EnglishQuest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/puzzle/memory"
            element={
              <ProtectedRoute>
                <MemoryGame />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

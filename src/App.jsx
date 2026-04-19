import { useState } from 'react'
import vocabulary from './data/vocabulary.js'
import UserSelect from './components/UserSelect/UserSelect.jsx'
import ModeSelect from './components/ModeSelect/ModeSelect.jsx'
import Quiz from './components/Quiz/Quiz.jsx'
import Results from './components/Results/Results.jsx'

export default function App() {
  const [screen, setScreen] = useState('user_select')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)
  const [quizResult, setQuizResult] = useState(null)

  function handleSelectUser(userId) {
    setSelectedUser(userId)
    setScreen('mode_select')
  }

  function handleSelectMode(mode) {
    setSelectedMode(mode)
    setScreen('quiz')
  }

  function handleQuizFinish(result) {
    setQuizResult(result)
    setScreen('results')
  }

  function handleRetry() {
    setQuizResult(null)
    setScreen('quiz')
  }

  function handleHome() {
    setQuizResult(null)
    setSelectedMode(null)
    setSelectedUser(null)
    setScreen('user_select')
  }

  function handleBackToModes() {
    setQuizResult(null)
    setSelectedMode(null)
    setScreen('mode_select')
  }

  return (
    <div className="app">
      {screen === 'user_select' && (
        <UserSelect onSelect={handleSelectUser} />
      )}
      {screen === 'mode_select' && (
        <ModeSelect
          userId={selectedUser}
          vocabulary={vocabulary}
          onSelect={handleSelectMode}
          onBack={handleHome}
        />
      )}
      {screen === 'quiz' && (
        <Quiz
          userId={selectedUser}
          mode={selectedMode}
          vocabulary={vocabulary}
          onFinish={handleQuizFinish}
          onBack={handleBackToModes}
        />
      )}
      {screen === 'results' && (
        <Results
          result={quizResult}
          onRetry={handleRetry}
          onHome={handleHome}
        />
      )}
    </div>
  )
}

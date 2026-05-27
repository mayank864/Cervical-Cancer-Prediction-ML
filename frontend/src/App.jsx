import { useState, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import ResultDisplay from './components/ResultDisplay'
import LoadingSpinner from './components/LoadingSpinner'

function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${10 + Math.random() * 20}s`,
    size: `${1 + Math.random() * 3}px`,
  }))

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            animation: `float ${p.duration} ${p.delay} infinite linear`,
          }}
        />
      ))}
    </div>
  )
}

function App() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleUpload = async (selectedFile) => {
    setFile(selectedFile)
    setLoading(true)
    setError(null)
    setResults(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResults(null)
    setError(null)
    setLoading(false)
  }

  return (
    <div className="animated-bg min-h-screen font-sans text-white relative overflow-x-hidden">
      <Particles />

      {/* Decorative gradient orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed top-[40%] right-[20%] w-[300px] h-[300px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-12 pb-4 px-4 text-center fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Medical cross icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
              Cervical Cancer
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white/90 mb-3 fade-in-up-delay-1">
            Risk Prediction
          </h2>
          <p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed fade-in-up-delay-2">
            Upload patient data in CSV format and leverage machine learning to receive 
            instant risk assessments with detailed probability scores.
          </p>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-start px-4 pb-16 pt-8">
          {loading ? (
            <LoadingSpinner />
          ) : results ? (
            <ResultDisplay results={results} onReset={handleReset} />
          ) : (
            <FileUpload onUpload={handleUpload} error={error} />
          )}
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-white/25 text-sm border-t border-white/5">
          <p>Major Project &middot; Mayank Raj - 229311080 &middot; CSE(Iot&amp;IS)</p>
        </footer>
      </div>
    </div>
  )
}

export default App

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 fade-in-up">
      {/* Spinner rings */}
      <div className="relative w-24 h-24 mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" style={{ animationDuration: '1.2s' }} />
        
        {/* Middle ring */}
        <div className="absolute inset-3 rounded-full border-2 border-white/5" />
        <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-fuchsia-500 animate-spin" style={{ animationDuration: '0.9s', animationDirection: 'reverse' }} />
        
        {/* Inner ring */}
        <div className="absolute inset-6 rounded-full border-2 border-white/5" />
        <div className="absolute inset-6 rounded-full border-2 border-transparent border-t-pink-500 animate-spin" style={{ animationDuration: '0.6s' }} />

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 animate-pulse" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-white/90 mb-2">Analyzing Your Data</h3>
      <p className="text-sm text-white/40 mb-6">Running ML model predictions...</p>

      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-500/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
          />
        ))}
      </div>
    </div>
  )
}

export default LoadingSpinner

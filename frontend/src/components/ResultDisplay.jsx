function CircularProgress({ percentage, isHighRisk, size = 72, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const gradientId = `progress-${isHighRisk ? 'red' : 'green'}-${Math.random().toString(36).slice(2, 7)}`

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {isHighRisk ? (
              <>
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f97316" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ animation: 'circularProgress 1s ease-out forwards' }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${isHighRisk ? 'text-red-400' : 'text-emerald-400'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, icon, color }) {
  const colorClasses = {
    purple: 'from-purple-500/20 to-fuchsia-500/20 text-purple-300',
    green: 'from-emerald-500/20 to-teal-500/20 text-emerald-300',
    red: 'from-red-500/20 to-orange-500/20 text-red-300',
    blue: 'from-blue-500/20 to-cyan-500/20 text-blue-300',
  }

  return (
    <div className="glass-card-hover p-5 text-center">
      <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <p className="text-2xl font-bold text-white/90">{value}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  )
}

function PredictionCard({ prediction, index }) {
  const isHighRisk = prediction.risk_level === 'High Risk'
  const probability = prediction.probability_percentage

  return (
    <div
      className={`
        glass-card-hover p-5 flex items-center gap-5 fade-in-up
      `}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Risk icon */}
      <div className={`
        w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
        ${isHighRisk
          ? 'bg-gradient-to-br from-red-500/30 to-orange-500/30'
          : 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30'
        }
      `}>
        {isHighRisk ? (
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-white/30 font-mono">Record #{index + 1}</span>
          <span className={`
            text-xs font-semibold px-2 py-0.5 rounded-full
            ${isHighRisk
              ? 'bg-red-500/20 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
            }
          `}>
            {prediction.risk_level}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isHighRisk
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
            style={{ width: `${probability}%` }}
          />
        </div>
      </div>

      {/* Circular progress */}
      <CircularProgress percentage={probability} isHighRisk={isHighRisk} />
    </div>
  )
}

function ResultDisplay({ results, onReset }) {
  const predictions = results.predictions || []
  const totalRecords = predictions.length
  const highRiskCount = predictions.filter((p) => p.risk_level === 'High Risk').length
  const lowRiskCount = totalRecords - highRiskCount
  const avgRisk = totalRecords > 0
    ? (predictions.reduce((sum, p) => sum + p.probability_percentage, 0) / totalRecords).toFixed(1)
    : 0

  return (
    <div className="w-full max-w-3xl fade-in-up">
      {/* Header with reset */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white/90">Analysis Results</h3>
          <p className="text-sm text-white/40 mt-1">Prediction complete for {totalRecords} record{totalRecords !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10
                     text-sm text-white/60 hover:bg-white/10 hover:text-white/90 transition-all duration-300
                     hover:scale-105 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
          New Upload
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <SummaryCard
          label="Total Records"
          value={totalRecords}
          icon="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
          color="purple"
        />
        <SummaryCard
          label="Low Risk"
          value={lowRiskCount}
          icon="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          color="green"
        />
        <SummaryCard
          label="High Risk"
          value={highRiskCount}
          icon="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          color="red"
        />
        <SummaryCard
          label="Avg Risk %"
          value={`${avgRisk}%`}
          icon="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
          color="blue"
        />
      </div>

      {/* Risk distribution bar */}
      {totalRecords > 0 && (
        <div className="glass-card p-5 mb-6">
          <p className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">Risk Distribution</p>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/5">
            {lowRiskCount > 0 && (
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                style={{ width: `${(lowRiskCount / totalRecords) * 100}%` }}
              />
            )}
            {highRiskCount > 0 && (
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                style={{ width: `${(highRiskCount / totalRecords) * 100}%` }}
              />
            )}
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-white/40">Low Risk ({lowRiskCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-xs text-white/40">High Risk ({highRiskCount})</span>
            </div>
          </div>
        </div>
      )}

      {/* Individual prediction cards */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Individual Predictions</p>
        {predictions.map((prediction, index) => (
          <PredictionCard key={index} prediction={prediction} index={index} />
        ))}
      </div>
    </div>
  )
}

export default ResultDisplay

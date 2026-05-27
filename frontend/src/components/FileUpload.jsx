import { useState, useRef } from 'react'

function FileUpload({ onUpload, error }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="w-full max-w-xl fade-in-up-delay-3">
      {/* Upload Card */}
      <div className="glass-card p-8 pulse-glow">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed p-10
            transition-all duration-300 text-center group
            ${isDragging
              ? 'border-purple-400 bg-purple-500/10 scale-[1.02]'
              : 'border-white/15 hover:border-purple-400/50 hover:bg-white/[0.03]'
            }
          `}
        >
          {/* Upload icon */}
          <div className={`
            mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5
            transition-all duration-300
            ${isDragging
              ? 'bg-purple-500/30 scale-110'
              : 'bg-white/5 group-hover:bg-purple-500/20 group-hover:scale-110'
            }
          `}>
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          <p className="text-lg font-semibold text-white/80 mb-1">
            {isDragging ? 'Drop your file here' : 'Drag & drop your CSV file'}
          </p>
          <p className="text-sm text-white/40">
            or <span className="text-purple-400 underline underline-offset-2">browse</span> to select
          </p>
          <p className="text-xs text-white/25 mt-3">Accepts .csv files only</p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Selected file display */}
        {selectedFile && (
          <div className="mt-6 flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 fade-in-up">
            {/* File icon */}
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{selectedFile.name}</p>
              <p className="text-xs text-white/40">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="text-white/30 hover:text-red-400 transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 fade-in-up">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-400">Upload Failed</p>
              <p className="text-xs text-red-300/70 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedFile}
          className={`
            mt-6 w-full py-3.5 px-6 rounded-xl text-sm font-semibold
            transition-all duration-300 flex items-center justify-center gap-2
            ${selectedFile
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-white/5 text-white/25 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          Analyze Data
        </button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z', label: 'Secure' },
          { icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z', label: 'Fast' },
          { icon: 'M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z', label: 'Accurate' },
        ].map((item) => (
          <div key={item.label} className="glass-card-hover p-4 text-center">
            <svg className="w-5 h-5 mx-auto text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <p className="text-xs font-medium text-white/50">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileUpload

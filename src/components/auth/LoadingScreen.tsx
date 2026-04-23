'use client'

interface LoadingScreenProps {
  message: string
  subMessage?: string
}

export default function LoadingScreen({ message, subMessage }: LoadingScreenProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner animado */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-500"></div>
        </div>
        
        {/* Mensaje principal */}
        <p className="text-sm text-gray-600">{message}</p>
        
        {/* Mensaje secundario opcional */}
        {subMessage && (
          <p className="text-xs text-gray-400">{subMessage}</p>
        )}
      </div>
    </main>
  )
}

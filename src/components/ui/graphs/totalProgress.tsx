"use client"

export default function TotalProgress() {
  const progress = 68 // 👈 luego lo conectas al backend

  return (
    <div className="w-full h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Project Progress
        </h3>
        <p className="text-sm text-gray-500">
          Total progress of the project based on completed tasks
        </p>
      </div>

      {/* Contenido centrado */}
      <div className="flex-1 flex flex-col justify-center">
        
        {/* Porcentaje grande */}
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold text-slate-900">
            {progress}%
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-[#6366f1] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>
    </div>
  )
}
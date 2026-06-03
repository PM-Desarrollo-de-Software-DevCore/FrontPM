// UI de carga a nivel del route group (app): se muestra al instante durante la
// navegacion entre rutas autenticadas mientras carga el segmento (mejora la
// velocidad percibida). Server component, sin dependencias.
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
          aria-hidden="true"
        />
        <p className="text-sm font-medium">Cargando...</p>
      </div>
    </div>
  )
}

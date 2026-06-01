import PortfolioFinancePanel from "@/components/finance/PortfolioFinancePanel"

export default function FinancePortfolioPage() {
  return (
    <div className="min-h-screen w-full px-8 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-800">Portafolio financiero</h1>
        <p className="mt-1 text-sm text-slate-500">
          Resumen financiero de todos tus proyectos.
        </p>
      </div>

      <PortfolioFinancePanel />
    </div>
  )
}

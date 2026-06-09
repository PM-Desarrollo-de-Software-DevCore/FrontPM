import { formatMoney, formatRatio, formatNumber, formatDate } from "@/lib/utils"

describe("formatMoney", () => {
  test("UT-04 retorna fallback cuando el valor es null", () => {
    expect(formatMoney(null)).toBe("N/A")
  })

  test("UT-05 formatea un número positivo con prefijo $", () => {
    const result = formatMoney(1500)
    expect(result).toMatch(/^\$/)
    expect(result).toContain("1")
  })
})

describe("formatRatio", () => {
  test("UT-06 convierte 0.5 en '50%' (con posible separador de miles)", () => {
    const result = formatRatio(0.5)
    expect(result).toMatch(/50/)
    expect(result).toContain("%")
  })
})

describe("formatNumber", () => {
  test("UT-07 retorna el fallback personalizado cuando el valor es undefined", () => {
    expect(formatNumber(undefined, "—")).toBe("—")
  })
})

describe("formatDate", () => {
  test("UT-08 formatea una fecha ISO válida sin corrimiento de zona horaria", () => {
    const result = formatDate("2025-03-15")
    // Espera que contenga el año y el día sin importar el formato exacto de locale
    expect(result).toContain("2025")
    expect(result).toMatch(/15/)
  })
})

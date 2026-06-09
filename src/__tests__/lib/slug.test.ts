import { slugify } from "@/lib/slug"

describe("slugify", () => {
  test("UT-01 elimina acentos y convierte a minúsculas", () => {
    expect(slugify("Café Proyéctó")).toBe("cafe-proyecto")
  })

  test("UT-02 reemplaza espacios múltiples por un solo guion", () => {
    expect(slugify("  Mi  Proyecto  Genial  ")).toBe("mi-proyecto-genial")
  })

  test("UT-03 elimina caracteres especiales no alfanuméricos", () => {
    expect(slugify("Hola! ¿Qué tal? #2025")).toBe("hola-que-tal-2025")
  })
})

import { parseEnvelope, authHeaders } from "@/lib/api"

function makeResponse(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response
}

describe("parseEnvelope", () => {
  test("UT-15 devuelve data cuando la respuesta es exitosa", async () => {
    const res = makeResponse({ success: true, data: { id: "123", name: "Test" } }, 200)
    const result = await parseEnvelope<{ id: string; name: string }>(res, "Error inesperado")
    expect(result).toEqual({ id: "123", name: "Test" })
  })

  test("UT-16 lanza error con el mensaje del backend cuando success es false", async () => {
    const res = makeResponse({ success: false, message: "No autorizado" }, 401)
    await expect(parseEnvelope(res, "Fallback error")).rejects.toThrow("No autorizado")
  })
})

describe("authHeaders", () => {
  test("UT-17 lanza error cuando no hay token en sesión", () => {
    // localStorage está limpio por el setup.ts (beforeEach)
    expect(() => authHeaders()).toThrow("Sesión expirada")
  })

  test("UT-18 devuelve headers con Authorization Bearer cuando hay token", () => {
    localStorage.setItem("authToken", "mi-token-secreto")
    const headers = authHeaders()
    expect(headers["Authorization"]).toBe("Bearer mi-token-secreto")
    expect(headers["Content-Type"]).toBe("application/json")
  })
})

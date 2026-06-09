import { normalizeUserRole, getDashboardRouteByRole, getToken, logout } from "@/lib/auth"

describe("normalizeUserRole", () => {
  test("UT-09 devuelve 'admin' cuando el rol es 'admin' (case-insensitive)", () => {
    expect(normalizeUserRole("ADMIN")).toBe("admin")
    expect(normalizeUserRole("Admin")).toBe("admin")
  })

  test("UT-10 devuelve 'user' para cualquier rol desconocido o vacío", () => {
    expect(normalizeUserRole("moderator")).toBe("user")
    expect(normalizeUserRole(null)).toBe("user")
    expect(normalizeUserRole(undefined)).toBe("user")
  })
})

describe("getDashboardRouteByRole", () => {
  test("UT-11 ruta de admin para rol 'admin'", () => {
    expect(getDashboardRouteByRole("admin")).toBe("/dashboard/admin")
  })

  test("UT-12 ruta de usuario para rol distinto a admin", () => {
    expect(getDashboardRouteByRole("user")).toBe("/dashboard/user")
    expect(getDashboardRouteByRole(null)).toBe("/dashboard/user")
  })
})

describe("getToken / logout", () => {
  test("UT-13 getToken retorna null cuando no hay token en localStorage", () => {
    expect(getToken()).toBeNull()
  })

  test("UT-14 logout elimina el token de localStorage", () => {
    localStorage.setItem("authToken", "fake-jwt-token")
    expect(getToken()).toBe("fake-jwt-token")
    logout()
    expect(getToken()).toBeNull()
  })
})

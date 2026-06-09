// localStorage mock para tests de auth (jsdom ya lo provee, pero lo dejamos
// explícito para claridad y para que cada test parta con storage limpio)
beforeEach(() => {
  localStorage.clear()
})

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import EditIcon from "@mui/icons-material/Edit"
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner"
import { API_BASE_URL, getToken } from "@/lib/auth"

type UserPreview = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneCode: string
  phoneNumber: string
  password: string
  nationality: string
  designation: string[]
  skills: string[]
  role: "user" | "admin"
  createdAt: string
  status?: "Editing" | "Active"
}

type UserForm = {
  firstName: string
  lastName: string
  email: string
  phoneCode: string
  phoneNumber: string
  password: string
  nationality: string
  designation: string[]
  skills: string[]
  role: "user" | "admin"
  createdAt: string
}

type BackendUser = {
  id: string | number
  name?: string
  lastname?: string
  email?: string
  phoneNumber?: string | null
  area?: string | null
  skill?: string | null
  globalRole?: "user" | "admin"
  role?: "user" | "admin"
  createdAt?: string | Date
}

type UserMutationPayload = {
  email: string
  password?: string
  name: string
  lastname: string
  globalRole: "user" | "admin"
  skill?: string
  area?: string
  phoneNumber?: string
}

type EditableFieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "phoneCode"
  | "phoneNumber"
  | "password"
  | "nationality"

const getTodayDate = () => new Date().toISOString().split("T")[0]

const parseDelimitedList = (value?: string | null) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : []

const formatDisplayDate = (date: string) => {
  if (!date) return "-"
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const emptyForm: UserForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneCode: "+52",
  phoneNumber: "",
  password: "",
  nationality: "",
  designation: [],
  skills: [],
  role: "user",
  createdAt: getTodayDate(),
}

export default function CreateUserPage() {
  const [users, setUsers] = useState<UserPreview[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [sortOrder, setSortOrder] = useState<"az" | "za">("az")
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [skillInput, setSkillInput] = useState("")
  const [designationInput, setDesignationInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [saveAlertMessage, setSaveAlertMessage] = useState<string | null>(null)
  const [isLoadingCV, setIsLoadingCV] = useState(false)
  const [cvError, setCVError] = useState<string | null>(null)
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    designation: "",
    skills: "",
  })
  const [formColumnHeight, setFormColumnHeight] = useState<number | null>(null)
  const formColumnRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!saveAlertMessage) return

    const timeoutId = window.setTimeout(() => {
      setSaveAlertMessage(null)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [saveAlertMessage])

  useEffect(() => {
    const element = formColumnRef.current
    if (!element) return

    const updateHeight = () => {
      setFormColumnHeight(element.getBoundingClientRect().height)
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(() => {
      updateHeight()
    })

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [formMode, selectedUserId, users, form, isLoadingCV, cvError, saveAlertMessage])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId]
  )

  const sortedUsers = useMemo(() => {
    const cloned = [...users]
    cloned.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()

      if (sortOrder === "az") return nameA.localeCompare(nameB)
      return nameB.localeCompare(nameA)
    })
    return cloned
  }, [users, sortOrder])

  const resetToCreateMode = () => {
    setFormMode("create")
    setSelectedUserId(null)
    setForm({
      ...emptyForm,
      createdAt: getTodayDate(),
    })
    setSkillInput("")
    setDesignationInput("")
    setErrors({
      email: "",
      phone: "",
      designation: "",
      skills: "",
    })
  }

  const loadUserIntoForm = (user: UserPreview) => {
    setFormMode("edit")
    setSelectedUserId(user.id)
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneCode: user.phoneCode,
      phoneNumber: user.phoneNumber,
      password: "",
      nationality: user.nationality,
      designation: [...user.designation],
      skills: [...user.skills],
      role: user.role,
      createdAt: user.createdAt,
    })
    setSkillInput("")
    setDesignationInput("")
    setErrors({
      email: "",
      phone: "",
      designation: "",
      skills: "",
    })
  }

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((user) => user.id === userId)
    if (!userToDelete) return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${userToDelete.firstName} ${userToDelete.lastName}?`
    )

    if (!confirmed) return

    const doDelete = async () => {
      try {
        const token = getToken()
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: 'DELETE',
          headers,
        })

        if (!res.ok) {
          // fallback to local delete if server fails
          setUsers((prev) => prev.filter((user) => user.id !== userId))
        } else {
          setUsers((prev) => prev.filter((user) => user.id !== userId))
        }

        if (selectedUserId === userId) {
          resetToCreateMode()
        }
        } catch {
          // fallback local
          setUsers((prev) => prev.filter((user) => user.id !== userId))
          if (selectedUserId === userId) resetToCreateMode()
      }
    }

    void doDelete()
  }

  // Fetch real users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true)
      try {
        const token = getToken()
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch(`${API_BASE_URL}/users`, { headers })
        if (!res.ok) return
          const payload: { success?: boolean; data?: BackendUser[] } = await res.json()
        if (!payload.success || !Array.isArray(payload.data)) return

        const mapped: UserPreview[] = payload.data.map((u: BackendUser, index: number) => ({
          id: String(u.id ?? index),
          firstName: u.name || "",
          lastName: u.lastname || "",
          email: u.email || "",
          phoneCode: "+52",
          phoneNumber: u.phoneNumber || "",
          password: "",
          nationality: "",
          designation: parseDelimitedList(u.area),
          skills: u.skill ? u.skill.split(',').map((s: string) => s.trim()) : [],
          role: u.globalRole === 'admin' ? 'admin' : 'user',
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : getTodayDate(),
        }))

        setUsers(mapped)
      } catch {
        // ignore - keep local data
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as { name: EditableFieldName; value: string }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "email") {
      setErrors((prev) => ({ ...prev, email: "" }))
    }

    if (name === "phoneNumber") {
      setErrors((prev) => ({ ...prev, phone: "" }))
    }
  }

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setCVError("Please upload a PDF file")
      return
    }

    try {
      setIsLoadingCV(true)
      setCVError(null)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_BASE_URL}/auth/upload-cv`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to process CV")
      }

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error("Invalid response from server")
      }

      const cvData = result.data

      // Populate form with extracted CV data
      setForm((prev) => ({
        ...prev,
        firstName: cvData.name?.split(" ")[0] || prev.firstName,
        lastName: cvData.name?.split(" ").slice(1).join(" ") || prev.lastName,
        skills: Array.isArray(cvData.skills) ? cvData.skills : prev.skills,
        designation: Array.isArray(cvData.experience_areas) ? cvData.experience_areas : prev.designation,
      }))

      setSaveAlertMessage("CV processed successfully! Form has been populated.")
    } catch (error) {
      setCVError(
        error instanceof Error ? error.message : "Failed to process CV"
      )
    } finally {
      setIsLoadingCV(false)
      // Reset the file input
      e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)

    // build payload matching backend fields
    const payload: UserMutationPayload = {
      email: form.email,
      password: form.password || undefined,
      name: form.firstName,
      lastname: form.lastName,
      globalRole: form.role,
      skill: form.skills.join(', '),
      area: form.designation.length > 0 ? form.designation.join(", ") : undefined,
      phoneNumber: form.phoneNumber || undefined,
    }

    try {
      const token = getToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      if (formMode === 'create') {
        // Use the auth register endpoint so password is hashed correctly
        const registerPayload = {
          email: form.email,
          password: form.password,
          name: form.firstName,
          lastname: form.lastName,
          globalRole: form.role,
        }

        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerPayload),
        })

        if (res.ok) {
          const body = await res.json()
          if (body.success && body.data) {
            const u = body.data
            let finalUserData: BackendUser = u

            // If we have an auth token (admin creating), attempt to update extra fields
            const token = getToken()
            if (token) {
              const updatePayload: Pick<UserMutationPayload, "skill" | "area" | "phoneNumber"> = {
                skill: form.skills.join(', '),
                area: form.designation.length > 0 ? form.designation.join(", ") : undefined,
                phoneNumber: form.phoneNumber || undefined,
              }

              try {
                const updRes = await fetch(`${API_BASE_URL}/users/${String(u.id)}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify(updatePayload),
                })

                if (updRes.ok) {
                  const updBody = await updRes.json()
                  if (updBody.success && updBody.data) finalUserData = updBody.data
                }
              } catch {
                // ignore update error, we'll still show the registered user
              }
            }

            const mapped: UserPreview = {
              id: String(finalUserData.id),
              firstName: finalUserData.name || form.firstName,
              lastName: finalUserData.lastname || form.lastName,
              email: finalUserData.email || form.email,
              phoneCode: '+52',
              phoneNumber: finalUserData.phoneNumber || form.phoneNumber,
              password: '',
              nationality: '',
              designation: parseDelimitedList(finalUserData.area).length > 0 ? parseDelimitedList(finalUserData.area) : form.designation,
              skills: finalUserData.skill ? finalUserData.skill.split(',').map((s: string) => s.trim()) : form.skills,
              role: finalUserData.globalRole || finalUserData.role || (form.role === 'admin' ? 'admin' : 'user'),
              createdAt: finalUserData.createdAt ? new Date(finalUserData.createdAt).toISOString().split('T')[0] : getTodayDate(),
            }

            setUsers((prev) => [mapped, ...prev])
          }
        } else {
          // fallback local create
          const newUser: UserPreview = {
            id: String(Date.now()),
            ...form,
            createdAt: getTodayDate(),
            status: 'Active',
          }
          setUsers((prev) => [newUser, ...prev])
        }

        resetToCreateMode()
        setSaveAlertMessage('User created successfully.')
      } else if (formMode === 'edit' && selectedUserId) {
        // update
        const res = await fetch(`${API_BASE_URL}/users/${selectedUserId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const body = await res.json()
          if (body.success && body.data) {
            const u = body.data
            setUsers((prev) => prev.map((user) => (user.id === selectedUserId ? {
              id: String(u.id),
              firstName: u.name || form.firstName,
              lastName: u.lastname || form.lastName,
              email: u.email || form.email,
              phoneCode: '+52',
              phoneNumber: u.phoneNumber || form.phoneNumber,
              password: '',
              nationality: '',
              designation: parseDelimitedList(u.area).length > 0 ? parseDelimitedList(u.area) : form.designation,
              skills: u.skill ? u.skill.split(',').map((s: string) => s.trim()) : form.skills,
              role: u.globalRole === 'admin' ? 'admin' : 'user',
              createdAt: user.createdAt,
            } : user)))
          }
        } else {
          // fallback local update
          setUsers((prev) => prev.map((user) => user.id === selectedUserId ? ({
            ...user,
            ...form,
            password: form.password || user.password,
          }) : user))
        }

        setSaveAlertMessage('User updated successfully.')
      }
    } catch {
      // fallback behaviors
      if (formMode === 'create') setSaveAlertMessage('User created locally (server error).')
      else setSaveAlertMessage('User updated locally (server error).')
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = () => {
    const value = skillInput.trim()
    if (!value || form.skills.includes(value)) {
      setSkillInput("")
      return
    }

    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, value],
    }))
    setSkillInput("")
    setErrors((prev) => ({ ...prev, skills: "" }))
  }

  const removeSkill = (index: number) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const addDesignation = () => {
    const value = designationInput.trim()
    if (!value || form.designation.includes(value)) {
      setDesignationInput("")
      return
    }

    setForm((prev) => ({
      ...prev,
      designation: [...prev.designation, value],
    }))
    setDesignationInput("")
    setErrors((prev) => ({ ...prev, designation: "" }))
  }

  const removeDesignation = (index: number) => {
    setForm((prev) => ({
      ...prev,
      designation: prev.designation.filter((_, i) => i !== index),
    }))
  }

  const handleRoleToggle = () => {
    const newRole = form.role === "admin" ? "user" : "admin"
    const confirmed = window.confirm(
      `Are you sure you want to change the user role to ${newRole}?`
    )

    if (!confirmed) return

    setForm((prev) => ({
      ...prev,
      role: newRole,
    }))
  }

  const validateForm = () => {
    let valid = true
    const newErrors = {
      email: "",
      phone: "",
      designation: "",
      skills: "",
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i
    if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Email must be valid and include .com"
      valid = false
    }

    const phoneDigits = form.phoneNumber.replace(/\D/g, "")
    if (phoneDigits.length < 10) {
      newErrors.phone = "Phone number must have at least 10 digits"
      valid = false
    }

    if (form.skills.length === 0) {
      newErrors.skills = "You must add at least one skill"
      valid = false
    }

    if (form.designation.length === 0) {
      newErrors.designation = "You must add at least one designation area"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  return (
    <div className="min-h-screen bg-white px-6 py-6">
      <div className="mx-auto w-full max-w-350">
        {saveAlertMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 shadow-sm">
            {saveAlertMessage}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-bold text-strong">Users</h1>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "az" | "za")}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-small text-muted outline-none transition focus:border-slate-400"
            >
              <option value="az">Alphabetical: A-Z</option>
              <option value="za">Alphabetical: Z-A</option>
            </select>

            <button
              type="button"
              onClick={resetToCreateMode}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-1 text-base font-semibold text-white transition hover:bg-slate-800"
            >
              <span className="text-xl leading-none">+</span>
              <span>Create User</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.6fr_0.7fr] xl:items-start">
          <section
            className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
            style={formColumnHeight ? { height: `${formColumnHeight}px` } : undefined}
          >
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-2">
              {isLoadingUsers ? (
                <div className="flex min-h-45 items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-sm font-medium text-slate-500">
                  Cargando usuarios...
                </div>
              ) : sortedUsers.length === 0 ? (
                <div className="flex min-h-45 items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-sm font-medium text-slate-500">
                  No hay usuarios para mostrar.
                </div>
              ) : (
                sortedUsers.map((user) => {
                const isSelected = selectedUserId === user.id && formMode === "edit"

                return (
                  <div
                    key={user.id}
                    className={`rounded-[24px] border px-5 py-4 shadow-sm transition ${
                      isSelected
                        ? "border-slate-700 bg-slate-50"
                        : "border-slate-200 bg-white"
                    } overflow-hidden`}
                  >
                    <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center">
                      <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-slate-700">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </div>
                      <div className="flex min-w-0 w-full items-center justify-between gap-5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 ">
                            <p className="text-base font-semibold text-slate-800">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="mt-1 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                              {user.role}
                            </p>
                          </div>
                          <p
                            className="truncate text-sm text-slate-500"
                            title={user.designation.join(", ")}
                          >
                            {user.designation.length > 0
                              ? user.designation.join(", ")
                              : "No Role Assigned"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Created: {formatDisplayDate(user.createdAt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => loadUserIntoForm(user)}
                            aria-label="Edit user"
                            className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                              isSelected
                              ? "border-slate-700 bg-slate-700 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                            }`}
                            >
                            <EditIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
                })
              )}
            </div>
          </section>

          <section ref={formColumnRef} className="flex min-h-0 flex-col rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} autoComplete="off" className="flex h-full min-h-0 flex-col">
              <div className="mb-8 flex items-center justify-between gap-4">
                <h2 className="text-4xl font-semibold text-slate-800">
                  {formMode === "create" ? "Create User" : "Edit Profile"}
                </h2>

                <div className="flex items-center gap-3">
                  {formMode === "edit" && selectedUser && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Delete User
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <span className="text-sm font-medium text-slate-600">User</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.role === "admin"}
                  onClick={handleRoleToggle}
                  className={`relative h-8 w-14 rounded-full transition-all duration-300 ease-in-out ${
                    form.role === "admin" ? "bg-indigo-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all duration-300 ease-in-out ${
                      form.role === "admin" ? "left-7" : "left-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-slate-600">Admin</span>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-5">
                  <FormField
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                  />

                  <FormField
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                  />
                </div>

                <div className="flex min-h-20 flex-col">
                  <label className="mb-2 block text-sm font-medium text-slate-500">
                    Upload CV (PDF)
                  </label>
                  <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-slate-400 hover:bg-slate-100">
                    <DocumentScannerIcon className="mb-4 text-5xl text-slate-700" fontSize="inherit" />
                    <span className="text-base font-semibold text-slate-800">
                      Upload CV
                    </span>
                    <span className="mt-2 text-sm text-slate-500">
                      PDF only. It will extract your information and auto-fill the form.
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleCVUpload}
                      disabled={isLoadingCV}
                      className="sr-only"
                    />
                  </label>
                  {isLoadingCV && (
                    <p className="mt-2 text-sm text-blue-600">Processing CV...</p>
                  )}
                  {cvError && (
                    <p className="mt-2 text-sm text-red-500">{cvError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-500">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    autoComplete="off"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={`h-14 w-full rounded-xl border bg-white px-4 text-base outline-none transition focus:border-slate-400 ${
                      errors.email ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-3">
                  <SelectField
                    label="Code"
                    name="phoneCode"
                    value={form.phoneCode}
                    onChange={handleChange}
                    options={[
                      { value: "+52", label: "+52" },
                      { value: "+1", label: "+1" },
                      { value: "+44", label: "+44" },
                      { value: "+91", label: "+91" },
                    ]}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-500">
                      Phone Number
                    </label>
                    <input
                      name="phoneNumber"
                      autoComplete="off"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      placeholder="Phone number"
                      className={`h-14 w-full rounded-xl border bg-white px-4 text-base outline-none transition focus:border-slate-400 ${
                        errors.phone ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <FormField
                  label="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    formMode === "create" ? "Create password" : "Change password"
                  }
                  type="password"
                  autoComplete="new-password"
                />

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-500">
                    Designation Areas
                  </label>
                  <div className="flex gap-3">
                    <input
                      value={designationInput}
                      onChange={(e) => setDesignationInput(e.target.value)}
                      placeholder="Backend Developer, Frontend Developer..."
                      autoComplete="off"
                      className={`h-14 w-full rounded-xl border bg-white px-4 text-base outline-none transition focus:border-slate-400 ${
                        errors.designation ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={addDesignation}
                      className="h-14 rounded-xl bg-slate-800 px-5 text-white hover:bg-slate-900"
                    >
                      Add
                    </button>
                  </div>

                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-500">{errors.designation}</p>
                  )}

                  {form.designation.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.designation.map((designation, index) => (
                        <button
                          key={`${designation}-${index}`}
                          type="button"
                          onClick={() => removeDesignation(index)}
                          className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
                        >
                          {designation} ✕
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-500">
                    Skills
                  </label>
                  <div className="flex gap-3">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="React, SQL, TypeScript..."
                      autoComplete="off"
                      className={`h-14 w-full rounded-xl border bg-white px-4 text-base outline-none transition focus:border-slate-400 ${
                        errors.skills ? "border-red-500" : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="h-14 rounded-xl bg-slate-800 px-5 text-white hover:bg-slate-900"
                    >
                      Add
                    </button>
                  </div>

                  {errors.skills && (
                    <p className="mt-1 text-sm text-red-500">{errors.skills}</p>
                  )}

                  {form.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.skills.map((skill, index) => (
                        <button
                          key={`${skill}-${index}`}
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
                        >
                          {skill} ✕
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="mt-10 flex justify-center">
                <button
                  type="submit"
                  className={`min-w-50 rounded-2xl px-10 py-4 text-lg font-semibold text-white transition ${
                    isSaving
                      ? "scale-95 bg-indigo-400"
                      : "bg-indigo-500 hover:scale-[1.03] hover:bg-indigo-600 active:scale-95"
                  }`}
                >
                  {isSaving
                    ? "Saving..."
                    : formMode === "create"
                    ? "Create User"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

type FormFieldProps = {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  autoComplete?: string
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete = "off",
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-500">
        {label}
      </label>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-slate-400"
      />
    </div>
  )
}

type SelectFieldProps = {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-500">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-700 outline-none transition focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
"use client"

import { useEffect, useMemo, useState } from "react"

type UserPreview = {
  id: number
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

type EditableFieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "phoneCode"
  | "phoneNumber"
  | "password"
  | "nationality"

const getTodayDate = () => new Date().toISOString().split("T")[0]

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

const initialUsers: UserPreview[] = [
  {
    id: 1,
    firstName: "Yash",
    lastName: "Ghori",
    email: "yash@example.com",
    phoneCode: "+91",
    phoneNumber: "9988776655",
    password: "",
    nationality: "India",
    designation: ["Developer"],
    skills: ["React", "Node.js"],
    role: "user",
    createdAt: "2026-04-10",
    status: "Editing",
  },
  {
    id: 2,
    firstName: "Anima",
    lastName: "Agrawal",
    email: "anima@example.com",
    phoneCode: "+91",
    phoneNumber: "8899776655",
    password: "",
    nationality: "India",
    designation: ["UI Intern"],
    skills: ["Figma", "CSS"],
    role: "admin",
    createdAt: "2026-04-11",
    status: "Active",
  },
  {
    id: 3,
    firstName: "Carlos",
    lastName: "Mendez",
    email: "carlos@example.com",
    phoneCode: "+52",
    phoneNumber: "8112345678",
    password: "",
    nationality: "Mexico",
    designation: ["Backend Developer"],
    skills: ["SQL", "Java"],
    role: "user",
    createdAt: "2026-04-12",
    status: "Active",
  },
]

export default function CreateUserPage() {
  const [users, setUsers] = useState<UserPreview[]>(initialUsers)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(1)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [sortOrder, setSortOrder] = useState<"az" | "za">("az")
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [skillInput, setSkillInput] = useState("")
  const [designationInput, setDesignationInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveAlertMessage, setSaveAlertMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    designation: "",
    skills: "",
  })

  useEffect(() => {
    if (!saveAlertMessage) return

    const timeoutId = window.setTimeout(() => {
      setSaveAlertMessage(null)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [saveAlertMessage])

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

  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find((user) => user.id === userId)
    if (!userToDelete) return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${userToDelete.firstName} ${userToDelete.lastName}?`
    )

    if (!confirmed) return

    setUsers((prev) => prev.filter((user) => user.id !== userId))

    if (selectedUserId === userId) {
      resetToCreateMode()
    }
  }

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)

    await new Promise((resolve) => setTimeout(resolve, 600))

    if (formMode === "create") {
      const newUser: UserPreview = {
        id: Date.now(),
        ...form,
        createdAt: getTodayDate(),
        status: "Active",
      }

      setUsers((prev) => [newUser, ...prev])
      resetToCreateMode()
      setSaveAlertMessage("User created successfully.")
      setIsSaving(false)
      return
    }

    if (formMode === "edit" && selectedUserId !== null) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUserId
            ? {
                ...user,
                ...form,
                createdAt: user.createdAt,
                password: form.password || user.password,
              }
            : user
        )
      )
      setSaveAlertMessage("User updated successfully.")
    }

    setIsSaving(false)
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
          <h1 className="text-4xl font-bold text-slate-800">Users</h1>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "az" | "za")}
              className="h-14 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option value="az">Alphabetical: A-Z</option>
              <option value="za">Alphabetical: Z-A</option>
            </select>

            <button
              type="button"
              onClick={resetToCreateMode}
              className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-7 text-base font-semibold text-white transition hover:bg-slate-800"
            >
              <span className="text-2xl leading-none">+</span>
              <span>Create User</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_1fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              {sortedUsers.map((user) => {
                const isSelected = selectedUserId === user.id && formMode === "edit"

                return (
                  <div
                    key={user.id}
                    className={`rounded-[24px] border px-5 py-4 shadow-sm transition ${
                      isSelected
                        ? "border-slate-700 bg-slate-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-slate-700">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </div>

                        <div>
                          <p className="text-base font-semibold text-slate-800">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="mt-1 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            {user.role}
                          </p>
                          <p className="text-sm text-slate-500">
                            {user.designation.length > 0
                              ? user.designation.join(", ")
                              : "-"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Created: {formatDisplayDate(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => loadUserIntoForm(user)}
                          className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                            isSelected
                              ? "border-slate-700 bg-slate-700 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} autoComplete="off" className="flex h-full flex-col">
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

                <SelectField
                  label="Nationality"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select nationality" },
                    { value: "Mexico", label: "Mexico" },
                    { value: "India", label: "India" },
                    { value: "Dominican Republic", label: "Dominican Republic" },
                    { value: "United States", label: "United States" },
                  ]}
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
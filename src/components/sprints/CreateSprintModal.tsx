"use client"

import {
  useState,
} from "react"

import {
  Sprint,
} from "@/types/sprint"

interface Props {

  open: boolean

  onCloseAction: () => void

  onSubmitAction: (
    sprint: Partial<Sprint>
  ) => Promise<void>
}

export default function CreateSprintModal({

  open,

  onCloseAction,

  onSubmitAction,

}: Props) {

  const [
    name,
    setName,
  ] = useState("")

  const [
    startDate,
    setStartDate,
  ] = useState("")

  const [
    endDate,
    setEndDate,
  ] = useState("")

  const [
    loading,
    setLoading,
  ] = useState(false)

  if (!open)
    return null

  const handleSubmit =
    async () => {

      const today =
        new Date()
          .toISOString()
          .split("T")[0]

      // VALIDATIONS

      if (
        !name ||
        !startDate ||
        !endDate
      ) {

        alert(
          "Please complete all fields."
        )

        return
      }

      if (
        startDate < today
      ) {

        alert(
          "Sprint start date cannot be in the past."
        )

        return
      }

      if (
        endDate <
        startDate
      ) {

        alert(
          "Sprint end date must be after the start date."
        )

        return
      }

      try {

        setLoading(true)

        await onSubmitAction({

          name,

          start_date:
            startDate,

          end_date:
            endDate,

          status:
            "active",
        })

        // RESET FORM

        setName("")
        setStartDate("")
        setEndDate("")

      } catch (error) {

        console.error(
          error
        )

      } finally {

        setLoading(false)
      }
    }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl">

        {/* HEADER */}

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-black">

            Create Sprint
          </h2>

          <button
            onClick={
              onCloseAction
            }
            className="text-2xl text-gray-400 transition hover:text-black"
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <div className="space-y-4">

          {/* NAME */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-600">

              Sprint Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Sprint 1 - Authentication"
              className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-blue-400"
            />
          </div>

          {/* DATES */}

          <div className="grid grid-cols-2 gap-4">

            {/* START DATE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-600">

                Start Date
              </label>

              <input
                type="date"

                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }

                value={
                  startDate
                }

                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }

                className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-blue-400"
              />
            </div>

            {/* END DATE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-600">

                End Date
              </label>

              <input
                type="date"

                min={
                  startDate ||
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }

                value={
                  endDate
                }

                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }

                className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-blue-400"
              />
            </div>
          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 pt-4">

            <button
              onClick={
                onCloseAction
              }
              className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={
                handleSubmit
              }

              disabled={
                loading
              }

              className="rounded-2xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Sprint"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
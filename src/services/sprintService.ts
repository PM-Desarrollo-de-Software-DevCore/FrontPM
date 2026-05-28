import { Sprint } from "@/types/sprint"

const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL

type BackendSprint =
  Omit<Sprint, "id"> & {
    id_sprint?: string
  }

function mapSprint(
  sprint: BackendSprint
): Sprint {

  return {

    id:
      sprint.id_sprint ||
      "",

    name:
      sprint.name,

    start_date:
      sprint.start_date,

    end_date:
      sprint.end_date,

    status:
      sprint.status,
  }
}

export async function getProjectSprints(
  projectId: string,
  token: string
): Promise<Sprint[]> {

  const response =
    await fetch(
      `${API_URL}/projects/${projectId}/sprints`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },
      }
    )

  if (!response.ok) {

    throw new Error(
      "Error fetching sprints"
    )
  }

  const data =
    await response.json()

  const sprints =
    Array.isArray(data)
      ? data
      : data.data ||
        []

  return sprints.map(
    mapSprint
  )
}

export async function createSprint(
  projectId: string,
  sprintData: Partial<Sprint>,
  token: string
) {

  console.log(
    "CREATE SPRINT BODY:",
    sprintData
  )

  const response =
    await fetch(
      `${API_URL}/projects/${projectId}/sprints`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          sprintData
        ),
      }
    )

  if (!response.ok) {

    const text =
      await response.text()

    console.error(
      text
    )

    throw new Error(
      "Error creating sprint"
    )
  }

  return response.json()
}

export async function updateSprint(
  sprintId: string,
  sprintData: Partial<Sprint>,
  token: string
) {

  const response =
    await fetch(
      `${API_URL}/sprints/${sprintId}`,
      {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          sprintData
        ),
      }
    )

  if (!response.ok) {

    const text =
      await response.text()

    console.error(
      text
    )

    throw new Error(
      "Error updating sprint"
    )
  }

  return response.json()
}

export async function deleteSprint(
  sprintId: string,
  token: string
) {

  const response =
    await fetch(
      `${API_URL}/sprints/${sprintId}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

  if (!response.ok) {

    const text =
      await response.text()

    console.error(
      text
    )

    throw new Error(
      "Error deleting sprint"
    )
  }

  return response.json()
}
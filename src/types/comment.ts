export interface Comment {
  id?: string
  commentId?: string
  id_comment?: string

  content?: string
  description?: string
  comment?: string

  taskId?: string
  id_task?: string

  authorId?: string
  id_user?: string

  createdAt?: string
  updatedAt?: string

  author?: {
    id?: string
    name?: string
    lastname?: string
    profilePhoto?: string
    image?: string
  }

  user?: {
    id?: string
    name?: string
    lastname?: string
    profilePhoto?: string
    image?: string
  }
}
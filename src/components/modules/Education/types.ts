export interface Lesson {
  id: string
  courseId: string
  title: string
  content?: string
  orderNum: number
  type: string
  createdAt: string

}
export interface Course {
  id: string
  title: string
  description?: string
  category?: string
  instructor?: string
  duration: number
  status: string
  createdAt: string
  _count?: { lessons: number }

}
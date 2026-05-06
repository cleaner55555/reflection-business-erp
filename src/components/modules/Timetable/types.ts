export type ScheduleEntry = {
  id: string
  subject: string
  teacher: string
  classGroup: string
  room: string
  dayOfWeek: 'ponedeljak' | 'utorak' | 'sreda' | 'cetvrtak' | 'petak' | 'subota'
  timeStart: string
  timeEnd: string
  type: 'lecture' | 'exercise' | 'lab' | 'seminar' | 'exam'
  semester: string
  status: 'active' | 'cancelled' | 'rescheduled' | 'completed'
  notes: string
}

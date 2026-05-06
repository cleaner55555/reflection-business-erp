export type Enrollment = {
  id: string
  applicantName: string
  jmbg: string
  email: string
  phone: string
  program: string
  studyLevel: 'bachelor' | 'master' | 'phd' | 'specialist'
  status: 'pending' | 'documents_submitted' | 'under_review' | 'accepted' | 'rejected' | 'enrolled'
  applicationDate: string
  entranceExamScore: number
  highSchoolGPA: number
  previousSchool: string
  city: string
  documentsComplete: boolean
  interviewDate: string
  notes: string
}

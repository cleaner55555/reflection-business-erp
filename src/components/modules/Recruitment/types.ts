export interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  type: string
  salaryMin?: number
  salaryMax?: number
  status: string
  applicantCount: number
  description?: string
  requirements?: string
  publishedAt?: string
  createdAt: string

}
export interface DashboardData {
  totalJobs: number
  openJobs: number
  closedJobs: number
  totalApplicants: number
  avgApplicantsPerJob: number
  recentJobs: JobPosting[]
  departmentBreakdown: Array<{ department: string; count: number }>

}
import { NextResponse } from 'next/server'

export async function GET() {
  // Skills module uses local/mock data — no Prisma model exists
  return NextResponse.json({
    totalSkills: 0,
    totalCategories: 0,
    certifiedEmployees: 0,
    averageSkillLevel: 0,
    skillCoverage: 0,
    totalCertifications: 0,
    expiringCertifications: 0,
    topSkills: [],
    skillsByCategory: [],
    recentAssessments: [],
    skillGaps: [],
  })
}

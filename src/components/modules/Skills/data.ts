export const skillLevels: SkillLevel[] = [
  { id: 'beginner', name: 'Početnik', value: 1, color: 'bg-gray-400', description: 'Osnovno znanje' },
  { id: 'elementary', name: 'Elementarni', value: 2, color: 'bg-blue-400', description: 'Razume osnove, može raditi pod nadzorom' },
  { id: 'intermediate', name: 'Srednji', value: 3, color: 'bg-yellow-400', description: 'Samostalan rad, solidno znanje' },
  { id: 'advanced', name: 'Napredni', value: 4, color: 'bg-orange-400', description: 'Duboko znanje, može voditi projekte' },
  { id: 'expert', name: 'Ekspert', value: 5, color: 'bg-red-400', description: 'Najviši nivo, mentori ostale' },
]

export const skillCategories = [
  { id: 'programming', name: 'Programiranje', icon: <Code className="h-4 w-4" />, color: '#3b82f6' },
  { id: 'database', name: 'Baze podataka', icon: <Database className="h-4 w-4" />, color: '#8b5cf6' },
  { id: 'devops', name: 'DevOps & Infrastruktura', icon: <Wrench className="h-4 w-4" />, color: '#f97316' },
  { id: 'design', name: 'Dizajn', icon: <Palette className="h-4 w-4" />, color: '#ec4899' },
  { id: 'soft_skills', name: 'Meke veštine', icon: <Users className="h-4 w-4" />, color: '#10b981' },
  { id: 'management', name: 'Menadžment', icon: <BarChart3 className="h-4 w-4" />, color: '#f59e0b' },
  { id: 'languages', name: 'Jezici', icon: <Globe className="h-4 w-4" />, color: '#06b6d4' },
  { id: 'analytical', name: 'Analitika', icon: <Brain className="h-4 w-4" />, color: '#6366f1' },
]

export const certStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktivan', color: 'bg-green-100 text-green-700' },
  expired: { label: 'Istekao', color: 'bg-red-100 text-red-700' },
  expiring_soon: { label: 'Uskoro ističe', color: 'bg-amber-100 text-amber-700' },
  revoked: { label: 'Opozvan', color: 'bg-gray-100 text-gray-700' },
}

export const gapPriorityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: 'Kritičan', color: 'bg-red-100 text-red-700' },
  high: { label: 'Visok', color: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Srednji', color: 'bg-amber-100 text-amber-700' },
  low: { label: 'Nizak', color: 'bg-blue-100 text-blue-700' },
}

export const mockSkills: Skill[] = [
  { id: 'sk-1', name: 'JavaScript', category: 'programming', description: 'JavaScript programski jezik za web razvoj', level: skillLevels[3], isActive: true, employeeCount: 12, createdAt: '2024-01-01' },
  { id: 'sk-2', name: 'TypeScript', category: 'programming', description: 'TypeScript - tipizirani JavaScript', level: skillLevels[4], isActive: true, employeeCount: 10, createdAt: '2024-01-01' },
  { id: 'sk-3', name: 'React', category: 'programming', description: 'React biblioteka za korisničke interfejse', level: skillLevels[3], isActive: true, employeeCount: 9, createdAt: '2024-01-01' },
  { id: 'sk-4', name: 'Node.js', category: 'programming', description: 'Node.js runtime za server-side JavaScript', level: skillLevels[3], isActive: true, employeeCount: 7, createdAt: '2024-01-01' },
  { id: 'sk-5', name: 'Python', category: 'programming', description: 'Python programski jezik', level: skillLevels[3], isActive: true, employeeCount: 6, createdAt: '2024-02-01' },
  { id: 'sk-6', name: 'PostgreSQL', category: 'database', description: 'PostgreSQL relaciona baza podataka', level: skillLevels[3], isActive: true, employeeCount: 8, createdAt: '2024-01-01' },
  { id: 'sk-7', name: 'MongoDB', category: 'database', description: 'MongoDB NoSQL baza podataka', level: skillLevels[2], isActive: true, employeeCount: 4, createdAt: '2024-03-01' },
  { id: 'sk-8', name: 'Docker', category: 'devops', description: 'Docker kontejnerizacija', level: skillLevels[3], isActive: true, employeeCount: 6, createdAt: '2024-01-01' },
  { id: 'sk-9', name: 'Kubernetes', category: 'devops', description: 'Kubernetes orkestracija kontejnera', level: skillLevels[2], isActive: true, employeeCount: 3, createdAt: '2024-02-01' },
  { id: 'sk-10', name: 'Figma', category: 'design', description: 'Figma alat za UI/UX dizajn', level: skillLevels[2], isActive: true, employeeCount: 4, createdAt: '2024-03-01' },
  { id: 'sk-11', name: 'Komunikacija', category: 'soft_skills', description: 'Komunikacione veštine', level: skillLevels[3], isActive: true, employeeCount: 18, createdAt: '2024-01-01' },
  { id: 'sk-12', name: 'Timski rad', category: 'soft_skills', description: 'Rad u timu', level: skillLevels[4], isActive: true, employeeCount: 20, createdAt: '2024-01-01' },
  { id: 'sk-13', name: 'Engleski jezik', category: 'languages', description: 'Engleski jezik - poslovni', level: skillLevels[3], isActive: true, employeeCount: 15, createdAt: '2024-01-01' },
  { id: 'sk-14', name: 'Nemački jezik', category: 'languages', description: 'Nemački jezik', level: skillLevels[1], isActive: true, employeeCount: 3, createdAt: '2024-04-01' },
  { id: 'sk-15', name: 'Projektni menadžment', category: 'management', description: 'Upravljanje projektima', level: skillLevels[3], isActive: true, employeeCount: 5, createdAt: '2024-02-01' },
]

export const mockEmployeeSkills: EmployeeSkill[] = [
  { id: 'es-1', employeeId: 'emp-1', employeeName: 'Marko Petrović', employeeDepartment: 'Razvoj', skillId: 'sk-1', skillName: 'JavaScript', level: 4, yearsExperience: 6, lastAssessed: '2025-01-10' },
  { id: 'es-2', employeeId: 'emp-1', employeeName: 'Marko Petrović', employeeDepartment: 'Razvoj', skillId: 'sk-2', skillName: 'TypeScript', level: 5, yearsExperience: 4, lastAssessed: '2025-01-10', certification: 'MS TypeScript Certified' },
  { id: 'es-3', employeeId: 'emp-1', employeeName: 'Marko Petrović', employeeDepartment: 'Razvoj', skillId: 'sk-3', skillName: 'React', level: 4, yearsExperience: 5, lastAssessed: '2025-01-10' },
  { id: 'es-4', employeeId: 'emp-2', employeeName: 'Ana Nikolić', employeeDepartment: 'Razvoj', skillId: 'sk-2', skillName: 'TypeScript', level: 5, yearsExperience: 7, lastAssessed: '2025-01-12' },
  { id: 'es-5', employeeId: 'emp-2', employeeName: 'Ana Nikolić', employeeDepartment: 'Razvoj', skillId: 'sk-3', skillName: 'React', level: 5, yearsExperience: 6, lastAssessed: '2025-01-12' },
  { id: 'es-6', employeeId: 'emp-2', employeeName: 'Ana Nikolić', employeeDepartment: 'Razvoj', skillId: 'sk-6', skillName: 'PostgreSQL', level: 3, yearsExperience: 3, lastAssessed: '2025-01-12' },
  { id: 'es-7', employeeId: 'emp-3', employeeName: 'Jelena Stanković', employeeDepartment: 'Razvoj', skillId: 'sk-4', skillName: 'Node.js', level: 4, yearsExperience: 5, lastAssessed: '2025-01-08' },
  { id: 'es-8', employeeId: 'emp-3', employeeName: 'Jelena Stanković', employeeDepartment: 'Razvoj', skillId: 'sk-8', skillName: 'Docker', level: 4, yearsExperience: 4, lastAssessed: '2025-01-08' },
  { id: 'es-9', employeeId: 'emp-3', employeeName: 'Jelena Stanković', employeeDepartment: 'Razvoj', skillId: 'sk-9', skillName: 'Kubernetes', level: 3, yearsExperience: 2, lastAssessed: '2025-01-08' },
  { id: 'es-10', employeeId: 'emp-4', employeeName: 'Petar Jovanović', employeeDepartment: 'Razvoj', skillId: 'sk-5', skillName: 'Python', level: 5, yearsExperience: 8, lastAssessed: '2025-01-15' },
  { id: 'es-11', employeeId: 'emp-4', employeeName: 'Petar Jovanović', employeeDepartment: 'Razvoj', skillId: 'sk-6', skillName: 'PostgreSQL', level: 5, yearsExperience: 8, lastAssessed: '2025-01-15', certification: 'PostgreSQL Certified Professional' },
  { id: 'es-12', employeeId: 'emp-5', employeeName: 'Ivan Đorđević', employeeDepartment: 'Dizajn', skillId: 'sk-10', skillName: 'Figma', level: 4, yearsExperience: 3, lastAssessed: '2025-01-05' },
  { id: 'es-13', employeeId: 'emp-5', employeeName: 'Ivan Đorđević', employeeDepartment: 'Dizajn', skillId: 'sk-1', skillName: 'JavaScript', level: 3, yearsExperience: 3, lastAssessed: '2025-01-05' },
  { id: 'es-14', employeeId: 'emp-6', employeeName: 'Nikola Ilić', employeeDepartment: 'DevOps', skillId: 'sk-8', skillName: 'Docker', level: 5, yearsExperience: 6, lastAssessed: '2025-01-14' },
  { id: 'es-15', employeeId: 'emp-6', employeeName: 'Nikola Ilić', employeeDepartment: 'DevOps', skillId: 'sk-9', skillName: 'Kubernetes', level: 4, yearsExperience: 4, lastAssessed: '2025-01-14', certification: 'CKA - Kubernetes Administrator' },
]

export const mockCertifications: Certification[] = [
  { id: 'cert-1', name: 'MS TypeScript Certified', employeeId: 'emp-1', employeeName: 'Marko Petrović', skillId: 'sk-2', skillName: 'TypeScript', issuedBy: 'Microsoft', issueDate: '2024-06-15', expiryDate: '2026-06-15', status: 'active', certificateNumber: 'MS-TS-2024-1234' },
  { id: 'cert-2', name: 'AWS Solutions Architect', employeeId: 'emp-4', employeeName: 'Petar Jovanović', skillId: 'sk-5', skillName: 'Python', issuedBy: 'Amazon', issueDate: '2024-03-20', expiryDate: '2027-03-20', status: 'active', certificateNumber: 'AWS-SA-2024-5678' },
  { id: 'cert-3', name: 'PostgreSQL Certified Professional', employeeId: 'emp-4', employeeName: 'Petar Jovanović', skillId: 'sk-6', skillName: 'PostgreSQL', issuedBy: 'PostgreSQL Global', issueDate: '2023-11-10', expiryDate: '2025-11-10', status: 'expiring_soon', certificateNumber: 'PG-CP-2023-9012' },
  { id: 'cert-4', name: 'CKA - Kubernetes Administrator', employeeId: 'emp-6', employeeName: 'Nikola Ilić', skillId: 'sk-9', skillName: 'Kubernetes', issuedBy: 'CNCF', issueDate: '2024-08-01', expiryDate: '2027-08-01', status: 'active', certificateNumber: 'CKA-2024-3456' },
  { id: 'cert-5', name: 'Docker Certified Associate', employeeId: 'emp-6', employeeName: 'Nikola Ilić', skillId: 'sk-8', skillName: 'Docker', issuedBy: 'Docker Inc.', issueDate: '2023-05-15', expiryDate: '2025-05-15', status: 'expired', certificateNumber: 'DCA-2023-7890' },
  { id: 'cert-6', name: 'Google UX Design Certificate', employeeId: 'emp-5', employeeName: 'Ivan Đorđević', skillId: 'sk-10', skillName: 'Figma', issuedBy: 'Google', issueDate: '2024-09-01', expiryDate: '2026-09-01', status: 'active', certificateNumber: 'GUX-2024-1111' },
]

export const mockAssessments: SkillAssessment[] = [
  { id: 'assess-1', employeeId: 'emp-1', employeeName: 'Marko Petrović', skillId: 'sk-2', skillName: 'TypeScript', previousLevel: 4, newLevel: 5, assessedBy: 'Ana Nikolić', assessmentDate: '2025-01-10', notes: 'Odlično poznavanje naprednih tipova i generika' },
  { id: 'assess-2', employeeId: 'emp-2', employeeName: 'Ana Nikolić', skillId: 'sk-3', skillName: 'React', previousLevel: 4, newLevel: 5, assessedBy: 'Jelena Stanković', assessmentDate: '2025-01-12', notes: 'Implementirala kompleksan state management sistem' },
  { id: 'assess-3', employeeId: 'emp-3', employeeName: 'Jelena Stanković', skillId: 'sk-9', skillName: 'Kubernetes', previousLevel: 2, newLevel: 3, assessedBy: 'Nikola Ilić', assessmentDate: '2025-01-08', notes: 'Uspješno deployovala microservices arhitekturu' },
  { id: 'assess-4', employeeId: 'emp-5', employeeName: 'Ivan Đorđević', skillId: 'sk-10', skillName: 'Figma', previousLevel: 3, newLevel: 4, assessedBy: 'Ana Nikolić', assessmentDate: '2025-01-05', notes: 'Kreirao design system za ceo tim' },
  { id: 'assess-5', employeeId: 'emp-6', employeeName: 'Nikola Ilić', skillId: 'sk-8', skillName: 'Docker', previousLevel: 4, newLevel: 5, assessedBy: 'Petar Jovanović', assessmentDate: '2025-01-14', notes: 'Optimizovao Docker image za produkciju' },
]

export const mockGaps: SkillGap[] = [
  { skillName: 'Kubernetes', requiredLevel: 4, currentLevel: 2.5, gap: 1.5, employeeCount: 6, priority: 'critical' },
  { skillName: 'Python', requiredLevel: 3, currentLevel: 1.8, gap: 1.2, employeeCount: 8, priority: 'high' },
  { skillName: 'TypeScript', requiredLevel: 4, currentLevel: 3.2, gap: 0.8, employeeCount: 5, priority: 'high' },
  { skillName: 'PostgreSQL', requiredLevel: 3, currentLevel: 2.3, gap: 0.7, employeeCount: 4, priority: 'medium' },
  { skillName: 'Figma', requiredLevel: 3, currentLevel: 2.5, gap: 0.5, employeeCount: 3, priority: 'low' },
  { skillName: 'Projektni menadžment', requiredLevel: 3, currentLevel: 2.0, gap: 1.0, employeeCount: 7, priority: 'medium' },
]

export const mockDashboard: SkillsDashboard = {
  totalSkills: 15,
  totalCategories: 8,
  certifiedEmployees: 5,
  averageSkillLevel: 3.4,
  skillCoverage: 72,
  totalCertifications: 6,
  expiringCertifications: 1,
  topSkills: [
    { name: 'Timski rad', employeeCount: 20, avgLevel: 4.0 },
    { name: 'Komunikacija', employeeCount: 18, avgLevel: 3.5 },
    { name: 'Engleski jezik', employeeCount: 15, avgLevel: 3.2 },
    { name: 'JavaScript', employeeCount: 12, avgLevel: 3.8 },
    { name: 'TypeScript', employeeCount: 10, avgLevel: 4.2 },
  ],
  skillsByCategory: [
    { category: 'Programiranje', count: 5, color: '#3b82f6' },
    { category: 'Baze podataka', count: 2, color: '#8b5cf6' },
    { category: 'DevOps', count: 2, color: '#f97316' },
    { category: 'Dizajn', count: 1, color: '#ec4899' },
    { category: 'Meke veštine', count: 2, color: '#10b981' },
    { category: 'Menadžment', count: 1, color: '#f59e0b' },
    { category: 'Jezici', count: 2, color: '#06b6d4' },
  ],
  recentAssessments: mockAssessments.slice(0, 3),
  skillGaps: mockGaps.slice(0, 3),
}

export const { activeCompanyId } = useAppStore();

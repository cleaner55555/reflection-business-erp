import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/employees/stats
export async function GET() {
  try {
    const total = await db.employee.count()
    const activeCount = await db.employee.count({ where: { isActive: true } })
    const inactiveCount = total - activeCount

    // Total salary cost
    const activeEmployees = await db.employee.findMany({
      where: { isActive: true },
      select: { baseSalary: true, department: true, hireDate: true },
    })
    const totalSalaryCost = activeEmployees.reduce((sum, e) => sum + e.baseSalary, 0)

    // Department breakdown
    const deptGroups: Record<string, number> = {}
    for (const e of activeEmployees) {
      const dept = e.department || 'Nedefinisano'
      deptGroups[dept] = (deptGroups[dept] || 0) + 1
    }

    // Department salary costs
    const deptSalary: Record<string, number> = {}
    for (const e of activeEmployees) {
      const dept = e.department || 'Nedefinisano'
      deptSalary[dept] = (deptSalary[dept] || 0) + e.baseSalary
    }

    // New hires this month
    const firstOfMonth = new Date()
    firstOfMonth.setDate(1)
    firstOfMonth.setHours(0, 0, 0, 0)
    const newThisMonth = await db.employee.count({
      where: { hireDate: { gte: firstOfMonth } },
    })

    // Upcoming anniversaries (hireDate this month in any year)
    const currentMonth = new Date().getMonth()
    const anniversaries = activeEmployees.filter((e) => {
      const hd = new Date(e.hireDate)
      return hd.getMonth() === currentMonth
    }).slice(0, 5).map((e) => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      hireDate: e.hireDate,
      years: new Date().getFullYear() - new Date(e.hireDate).getFullYear(),
    }))

    // Attendance summary - current month
    const currentMonthNum = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const monthStart = new Date(currentYear, currentMonthNum - 1, 1)
    const monthEnd = new Date(currentYear, currentMonthNum, 0, 23, 59, 59)

    const monthAttendances = await db.attendance.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
    })

    const attendanceByType: Record<string, { count: number; hours: number }> = {}
    for (const a of monthAttendances) {
      if (!attendanceByType[a.type]) attendanceByType[a.type] = { count: 0, hours: 0 }
      attendanceByType[a.type].count++
      attendanceByType[a.type].hours += a.hoursWorked
    }

    // Payroll summary - current month
    const monthPayrolls = await db.payroll.findMany({
      where: { month: currentMonthNum, year: currentYear },
    })
    const payrollTotal = monthPayrolls.reduce((s, p) => s + p.netSalary, 0)
    const payrollPaid = monthPayrolls.filter((p) => p.status === 'isplaceno').length

    // Departments list
    const departments = Object.entries(deptGroups)
      .map(([name, count]) => ({ name, count, avgSalary: Math.round(deptSalary[name] / count) }))
      .sort((a, b) => b.count - a.count)

    // Attendance types with labels
    const typeLabels: Record<string, string> = {
      rad: 'Rad', bolovanje: 'Bolovanje', godisnji: 'Godišnji', sluzbeni_put: 'Službeni put', odsustvo: 'Odsustvo',
    }

    return NextResponse.json({
      total,
      active: activeCount,
      inactive: inactiveCount,
      totalSalaryCost,
      avgSalary: activeEmployees.length > 0 ? Math.round(totalSalaryCost / activeEmployees.length) : 0,
      newThisMonth,
      anniversaries,
      departments,
      attendanceByType: Object.entries(attendanceByType).map(([type, data]) => ({
        type,
        label: typeLabels[type] || type,
        ...data,
      })),
      totalAttendanceHours: monthAttendances.reduce((s, a) => s + a.hoursWorked, 0),
      payrollTotal,
      payrollPaid,
      payrollTotalCount: monthPayrolls.length,
    })
  } catch (error) {
    console.error('Error fetching employee stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

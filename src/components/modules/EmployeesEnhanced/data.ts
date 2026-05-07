export const load = async () => {
      const [eRes, empRes] = await Promise.all([fetch('/api/employee-evaluations'), fetch('/api/employees')])
      if (cancelled) return
      setEvaluations(await eRes.json())
      setEmployees(await empRes.json())

}
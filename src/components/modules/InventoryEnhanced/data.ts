export const load = async () => {
      const [lRes, pRes, locRes] = await Promise.all([fetch('/api/lots'), fetch('/api/products'), fetch('/api/warehouse-locations')])
      if (cancelled) return
      setLots(await lRes.json())
      setProducts(await pRes.json())
      setLocations(await locRes.json())

}
export const MODULE_CONTEXT: Record<string, string> = {
  dashboard: 'pregledne instrument table',
  finansije: 'modul finansije',
  fakture: 'modul fakture',
  magacin: 'modul magacin',
  partneri: 'modul partneri',
  nabavka: 'modul nabavka',
  crm: 'modul CRM',
  kalendar: 'modul kalendar',
  zaposleni: 'modul zaposleni',
  projekti: 'modul projekti',
  sredstva: 'modul osnovna sredstva',
  dokumenta: 'modul dokumenta',
  knjigovodstvo: 'modul knjigovodstvo',
  protokol: 'modul protokol',
  edukacija: 'modul edukacija',
  'vozni-park': 'modul vozni park',
  izvestaji: 'modul izveštaji',
  podesavanja: 'podešavanja sistema',
}

export const MODULE_LABELS: Record<string, string> = {
  fakture: 'Fakture',
  partneri: 'Partneri',
  magacin: 'Magacin',
  finansije: 'Finansije',
  crm: 'CRM',
  kalendar: 'Kalendar',
  zaposleni: 'Zaposleni',
  projekti: 'Projekti',
  sredstva: 'Sredstva',
  dokumenta: 'Dokumenta',
  knjigovodstvo: 'Knjigovodstvo',
  protokol: 'Protokol',
  edukacija: 'Edukacija',
  'vozni-park': 'Vozni park',
  izvestaji: 'Izveštaji',
  nabavka: 'Nabavka',
}

export const SUGGESTION_CHIPS = [
  { label: 'Prikaži neplaćene fakture', icon: AlertCircle },
  { label: 'Koje robe fale?', icon: BarChart3 },
  { label: 'Top partneri', icon: TableIcon },
  { label: 'Kreiraj fakturu', icon: Send },
  { label: 'Stanje blagajne', icon: BarChart3 },
]

export const dataKeys = Object.keys(chartConfig);

export const COLORS = ['#22c55e', '#ef4444', '#eab308', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1']

export const renderPieChart = () => {
    const pieData = chartData.map((d, i) => ({
      name: d[Object.keys(d)[0]] as string,
      value: d[Object.keys(d)[1]] as number,
      color: chartConfig[Object.keys(d)[1] as string]?.color || COLORS[i % COLORS.length],
    }))

    return (
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={35}
            paddingAngle={2}
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    )
  }

export const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <XAxis
          dataKey={Object.keys(chartData[0])[0]}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        {dataKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={chartConfig[key]?.color || COLORS[i % COLORS.length]}
            radius={[3, 3, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

export const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <XAxis
          dataKey={Object.keys(chartData[0])[0]}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        {dataKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={chartConfig[key]?.color || COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

export const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <XAxis
          dataKey={Object.keys(chartData[0])[0]}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        {dataKeys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={chartConfig[key]?.color || COLORS[i % COLORS.length]}
            fill={chartConfig[key]?.color || COLORS[i % COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );

export const label = MODULE_LABELS[module] || module;

export const { activeModule, setActiveModule } = useAppStore();

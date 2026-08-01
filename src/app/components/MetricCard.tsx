export default function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="srg-kpi">
      <p className="srg-kpi-label">{label}</p>
      <p className="srg-kpi-value">{value}</p>
    </div>
  )
}

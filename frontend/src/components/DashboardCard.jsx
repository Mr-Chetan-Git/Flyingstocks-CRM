export default function DashboardCard({
  title,
  value,
  icon: Icon,
  subtext,
  subtextClass = "positive",
  onClick
}) {
  return (
    <div 
      className="crm-stat-card" 
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="crm-stat-header">
        <h3 className="crm-stat-title">{title}</h3>
        {Icon && (
          <div className="crm-stat-icon-wrapper">
            <Icon />
          </div>
        )}
      </div>

      <div className="crm-stat-value">{value}</div>

      {subtext && (
        <p className={`crm-stat-subtext ${subtextClass}`}>
          {subtext}
        </p>
      )}
    </div>
  );
}
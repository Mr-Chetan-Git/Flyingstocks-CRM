import { Link } from "react-router-dom";

export default function LeadsTable({ leads = [] }) {
  // Reference leads sample matching the design image if leads array is custom or empty
  const defaultLeads = [
    {
      id: 1,
      name: "John Doe",
      role: "VP of Sales",
      company: "Acme Corp",
      email: "j.doe@acme.com",
      phone: "555-0192",
      value: "$45,000",
      status: "Negotiating",
      avatarBg: "#94a3b8"
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Director of IT",
      company: "TechFlow Inc",
      email: "sarah.w@techflow.io",
      phone: "555-0841",
      value: "$120,000",
      status: "Discovery",
      avatarBg: "#64748b"
    },
    {
      id: 3,
      name: "Michael Ross",
      role: "CEO",
      company: "Global Logistics",
      email: "m.ross@globallog.com",
      phone: "555-0322",
      value: "$8,500",
      status: "At Risk",
      avatarBg: "#f43f5e"
    }
  ];

  // Helper to extract initials from full name
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper to determine status badge style class
  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("negotiat") || s.includes("interested") || s.includes("active")) {
      return "crm-status-negotiating";
    }
    if (s.includes("risk") || s.includes("lost") || s.includes("closed")) {
      return "crm-status-at-risk";
    }
    return "crm-status-discovery";
  };

  // Prepare table rows from props or fallback to reference defaults
  const displayRows = leads.length > 0
    ? leads.map((item, idx) => ({
        id: item.id || idx,
        name: item.name || "Customer",
        role: item.designation || item.role || "Client",
        company: item.company || "Company",
        email: item.email || "info@example.com",
        phone: item.mobile || item.phone || "555-0000",
        value: item.value || `$${(10000 + (item.id || idx) * 3500).toLocaleString()}`,
        status: item.state || item.prediction || item.status || (idx % 3 === 0 ? "Negotiating" : idx % 3 === 1 ? "Discovery" : "At Risk"),
        avatarBg: idx % 3 === 0 ? "#94a3b8" : idx % 3 === 1 ? "#64748b" : "#f43f5e"
      }))
    : defaultLeads;

  return (
    <div className="crm-leads-card">
      {/* Top Header Row */}
      <div className="crm-leads-header">
        <h2 className="crm-leads-title">Recent Leads</h2>
        <Link to="/customers" className="crm-view-all-link">
          View All
        </Link>
      </div>

      {/* Table Wrapper */}
      <div className="crm-table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Company</th>
              <th>Contact Info</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr key={row.id}>
                {/* Contact Column */}
                <td>
                  <div className="crm-contact-cell">
                    <div 
                      className="crm-avatar-circle"
                      style={{ backgroundColor: row.avatarBg }}
                    >
                      {getInitials(row.name)}
                    </div>
                    <div>
                      <p className="crm-contact-name">{row.name}</p>
                      <p className="crm-contact-role">{row.role}</p>
                    </div>
                  </div>
                </td>

                {/* Company Column */}
                <td>
                  <span className="crm-company-name">{row.company}</span>
                </td>

                {/* Contact Info Column */}
                <td>
                  <p className="crm-contact-info-email">{row.email}</p>
                  <p className="crm-contact-info-phone">{row.phone}</p>
                </td>

                {/* Value Column */}
                <td>
                  <span className="crm-value-text">{row.value}</span>
                </td>

                {/* Status Column */}
                <td>
                  <span className={`crm-status-badge ${getStatusClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { NavLink, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiHome,
  FiUsers,
  FiStar,
  FiUserCheck,
  FiCalendar,
  FiHelpCircle,
  FiBarChart2,
  FiCpu,
  FiFileText,
  FiLogOut
} from "react-icons/fi";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const currentPathWithSearch = location.pathname + location.search;

  // Helper to accurately match paths with query parameters
  const isLinkActive = (targetPath) => {
    if (targetPath === "/customers") {
      return location.pathname === "/customers" && !location.search.includes("filter=");
    }
    return currentPathWithSearch === targetPath;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`crm-sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`crm-sidebar ${isOpen ? "open" : ""}`}>
        <div>
          {/* Brand Logo & Name */}
          <NavLink to="/dashboard" className="crm-sidebar-brand" onClick={onClose}>
            <FiGrid className="crm-brand-icon" />
            <span className="crm-brand-name">Precision</span>
          </NavLink>

          {/* Navigation Links */}
          <ul className="crm-nav-list">
            <li>
  <NavLink
    to="/main-menu"
    className= {`crm-nav-link ${location.pathname === "/main-menu" ? "active" : ""}`}
    onClick={onClose}
  >
    <FiHome className="crm-nav-icon" />
    <span>Main Menu</span>
  </NavLink>
</li>
            <li>
              <NavLink 
                to="/dashboard" 
                className={`crm-nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                onClick={onClose}
              >
                <FiGrid className="crm-nav-icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>

            {/* Note: The old /customers list page is disabled from navigation */}

            <li>
              <NavLink 
                to="/customers?filter=interested" 
                className={`crm-nav-link ${isLinkActive("/customers?filter=interested") ? "active" : ""}`}
                onClick={onClose}
              >
                <FiStar className="crm-nav-icon" />
                <span>Interested</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/customers?filter=registered" 
                className={`crm-nav-link ${isLinkActive("/customers?filter=registered") ? "active" : ""}`}
                onClick={onClose}
              >
                <FiUserCheck className="crm-nav-icon" />
                <span>Registered</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/customers?filter=follow_up" 
                className={`crm-nav-link ${isLinkActive("/customers?filter=follow_up") ? "active" : ""}`}
                onClick={onClose}
              >
                <FiCalendar className="crm-nav-icon" />
                <span>Follow Up</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/analytics" 
                className={`crm-nav-link ${location.pathname === "/analytics" ? "active" : ""}`}
                onClick={onClose}
              >
                <FiBarChart2 className="crm-nav-icon" />
                <span>Analytics</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/ai" 
                className={`crm-nav-link ${location.pathname === "/ai" ? "active" : ""}`}
                onClick={onClose}
              >
                <FiCpu className="crm-nav-icon" />
                <span>AI Insights</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/reports" 
                className={`crm-nav-link ${location.pathname === "/reports" ? "active" : ""}`}
                onClick={onClose}
              >
                <FiFileText className="crm-nav-icon" />
                <span>Reports</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Footer Item: Help & Support & Logout */}
        <div className="crm-sidebar-footer">
          <button className="crm-help-btn mb-2" onClick={() => alert("Precision CRM Support is ready to assist you!")}>
            <FiHelpCircle size={18} />
            <span>Help & Support</span>
          </button>
          
          <NavLink 
            to="/" 
            className="crm-nav-link text-danger" 
            style={{ padding: "8px 16px" }}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              if (onClose) onClose();
            }}
          >
            <FiLogOut className="crm-nav-icon" />
            <span>Logout</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
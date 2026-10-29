import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FiMenu } from "react-icons/fi";
import "../styles/dashboard.css";

export default function MainLayout({ children, title = "CRM Dashboard", searchValue = "", onSearch, hideSidebar = false, hideNavbar = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard" || hideSidebar;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`crm-layout ${isDashboard ? "crm-layout-fullwidth" : ""}`}>
      {/* Sidebar is completely omitted on /dashboard */}
      {!isDashboard && (
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}

      {/* Main Content Wrapper */}
      <div className={`crm-main-wrapper ${isDashboard ? "crm-main-fullwidth" : ""}`}>
        {/* Render Top Navbar ONLY on non-dashboard pages that require it */}
        {!isDashboard && !hideNavbar && (
          <Navbar 
            onToggleSidebar={toggleSidebar} 
            title={title} 
            searchValue={searchValue}
            onSearch={onSearch}
          />
        )}

        {/* Dynamic Page Content */}
        <main className={`crm-content ${isDashboard ? "crm-content-fullwidth p-0" : "pt-4"}`}>
          {/* Mobile hamburger toggle for non-dashboard pages with sidebar */}
          {!isDashboard && (
            <div className="d-block d-md-none mb-3">
              <button 
                className="crm-mobile-toggle" 
                onClick={toggleSidebar}
                aria-label="Toggle Navigation Sidebar"
              >
                <FiMenu />
              </button>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
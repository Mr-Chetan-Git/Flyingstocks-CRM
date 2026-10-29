import { useState, useEffect, useRef } from "react";
import { FiSearch, FiPlus, FiMenu, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onToggleSidebar, title = "CRM Dashboard", searchValue = "", onSearch, onProfileClick }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Retrieve authenticated user from session state (localStorage)
  const getAuthUserInfo = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const name = user?.full_name || user?.name || user?.username || user?.email || "";
        const initial = name && typeof name === "string" && name.trim().length > 0
          ? name.trim().charAt(0).toUpperCase()
          : "A";
        return {
          initial,
          displayName: name.trim() || "User Profile",
          fullName: user?.full_name || user?.name || "User",
          email: user?.email || "",
          role: user?.role || "User"
        };
      }
    } catch (err) {
      console.error("Error reading authenticated user session:", err);
    }
    return {
      initial: "A",
      displayName: "Admin Profile",
      fullName: "Admin User",
      email: "admin@example.com",
      role: "Admin"
    };
  };

  const [userInfo, setUserInfo] = useState(getAuthUserInfo);

  useEffect(() => {
    setUserInfo(getAuthUserInfo());
  }, []);

  // Click outside and ESC key handler to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleSearchChange = (e) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleUploadClick = () => {
    navigate("/customers/add");
  };

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    if (onProfileClick) {
      onProfileClick(e);
    }
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="crm-header">
      <div className="d-flex align-items-center gap-3">
        <button 
          className="crm-mobile-toggle" 
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
        >
          <FiMenu />
        </button>
        <h1 className="crm-header-title">{title}</h1>
      </div>

      <div className="crm-header-actions">
        {/* Search Input */}
        <div className="crm-search-box">
          <FiSearch className="crm-search-icon" />
          <input
            type="text"
            className="crm-search-input"
            placeholder="Search leads, tasks..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>

        {/* Upload Data Button */}
        <button className="crm-upload-btn" onClick={handleUploadClick}>
          <FiPlus size={18} />
          <span>Upload Data</span>
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="crm-user-avatar-container" ref={dropdownRef}>
          <div 
            className={`crm-user-avatar-wrapper ${dropdownOpen ? "active" : ""}`} 
            title={userInfo.displayName}
            onClick={handleToggleDropdown}
            role="button"
            tabIndex={0}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label={`User profile menu for ${userInfo.displayName}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggleDropdown(e);
              }
            }}
          >
            <div className="crm-user-avatar-initial">
              {userInfo.initial}
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="crm-profile-dropdown" role="menu">
              <div className="crm-dropdown-header">
                <div className="crm-dropdown-user-name">{userInfo.fullName}</div>
                {userInfo.email && (
                  <div className="crm-dropdown-user-email">{userInfo.email}</div>
                )}
                {userInfo.role && (
                  <span className="crm-dropdown-role-badge">
                    {userInfo.role}
                  </span>
                )}
              </div>

              <div className="crm-dropdown-divider" />

              <div className="crm-dropdown-body">
                <button 
                  className="crm-dropdown-item logout-btn" 
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <FiLogOut className="crm-dropdown-icon" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
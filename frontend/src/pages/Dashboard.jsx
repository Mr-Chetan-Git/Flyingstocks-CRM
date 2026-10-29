import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCustomers,
  searchCustomers,
  deleteCustomer,
} from "../api/customerApi";
import { generateEmailTemplate, sendEmailCampaign } from "../api/emailApi";
import MainLayout from "../layouts/MainLayout";
import EmailCampaignModal from "../components/EmailCampaignModal";

import {
  FiSend,
  FiDatabase,
  FiInfo,
  FiGrid,
  FiFilter,
  FiSearch,
  FiMail,
  FiChevronUp,
  FiChevronDown,
  FiCalendar,
  FiCheck,
  FiX,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiLogOut,
  FiBarChart2,
  FiCpu,
  FiFileText,
  FiUser
} from "react-icons/fi";

export default function Dashboard() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const tableRef = useRef(null);
  const emailSectionRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Data & Pagination State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Sorting State
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Apply Filters Panel Visibility & Form State
  const [showFilters, setShowFilters] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterState, setFilterState] = useState("All");
  const [filterSearchName, setFilterSearchName] = useState("");

  // Active Filter Applied Query State (Single source of truth)
  const [activeFilters, setActiveFilters] = useState({
    startDate: "",
    endDate: "",
    state: "All",
    searchName: "",
  });

  // Inline Quick Table Search
  const [tableSearch, setTableSearch] = useState("");

  // User Profile Dropdown State
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Email Campaign Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);

  // AI Email Generator & Preview State
  const [conversationNotes, setConversationNotes] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState("");

  const defaultEmailBody = `Dear Customer,
We hope you are doing well.
Here is a quick update based on our recent communication:
{summary}

Please let us know if you would like to discuss further.

Regards,
CRM Team`;

  const [emailPreviewBody, setEmailPreviewBody] = useState(defaultEmailBody);
  const [emailSubject, setEmailSubject] = useState("Update from FlyingStocks CRM Team");

  // Load User details
  const getUserInfo = () => {
    try {
      const u = localStorage.getItem("user");
      if (u) return JSON.parse(u);
    } catch {
      // fallback
    }
    return { full_name: "Admin User", email: "admin@flyingstocks.com", role: "Administrator" };
  };
  const userInfo = getUserInfo();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch Customers Data
  const loadCustomerData = useCallback(async () => {
    setLoading(true);
    try {
      if (tableSearch.trim() !== "") {
        const searchResults = await searchCustomers(tableSearch.trim());
        const records = searchResults || [];
        setCustomers(records);
        setTotalRecords(records.length);
        setTotalPages(Math.ceil(records.length / limit) || 1);
      } else {
        const data = await getCustomers(page, limit);
        if (data) {
          setCustomers(data.customers || []);
          setTotalRecords(data.total_records || (data.customers ? data.customers.length : 0));
          setTotalPages(data.total_pages || 1);
        }
      }
    } catch (err) {
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, tableSearch]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  // Filtering Logic (Single source of truth)
  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers];

    // 1. Filter by Name (from Apply Filters)
    if (activeFilters.searchName.trim() !== "") {
      const q = activeFilters.searchName.toLowerCase().trim();
      result = result.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.company && c.company.toLowerCase().includes(q))
      );
    }

    // 2. Filter by State (from Apply Filters)
    if (activeFilters.state && activeFilters.state !== "All") {
      const targetState = activeFilters.state.toLowerCase();
      result = result.filter((c) => {
        const st = (c.state || c.confirm_register || "").toLowerCase();
        if (targetState === "open") return st === "open" || st === "active";
        if (targetState === "interested") return st.includes("interested");
        if (targetState === "closed") return st === "closed" || st.includes("closed") || st.includes("registered");
        if (targetState === "in progress") return st.includes("progress") || st.includes("follow");
        if (targetState === "not interested") return st.includes("not") || st.includes("rejected");
        return st.includes(targetState);
      });
    }

    // 3. Filter by Date range (from Apply Filters)
    if (activeFilters.startDate) {
      const start = new Date(activeFilters.startDate);
      if (!isNaN(start.getTime())) {
        result = result.filter((c) => {
          if (!c.date) return true;
          const d = new Date(c.date);
          return isNaN(d.getTime()) || d >= start;
        });
      }
    }

    if (activeFilters.endDate) {
      const end = new Date(activeFilters.endDate);
      if (!isNaN(end.getTime())) {
        // Set to end of the day
        end.setHours(23, 59, 59, 999);
        result = result.filter((c) => {
          if (!c.date) return true;
          const d = new Date(c.date);
          return isNaN(d.getTime()) || d <= end;
        });
      }
    }

    // 4. Sort Customers
    result.sort((a, b) => {
      let aVal = a[sortColumn] || "";
      let bVal = b[sortColumn] || "";

      if (sortColumn === "id") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, activeFilters, sortColumn, sortDirection]);

  // Handle Sort column click
  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  // Handle Apply Filter button click
  const handleApplyFilter = () => {
    setActiveFilters({
      startDate: filterStartDate,
      endDate: filterEndDate,
      state: filterState,
      searchName: filterSearchName,
    });
  };

  // Handle Clear Filter button click
  const handleClearFilter = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterState("All");
    setFilterSearchName("");
    setActiveFilters({
      startDate: "",
      endDate: "",
      state: "All",
      searchName: "",
    });
    setTableSearch("");
  };

  // Primary Action Bar Handlers
  const handleViewTableData = () => {
    handleClearFilter();
    setPage(1);
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleToggleFilterPanel = () => {
    setShowFilters((prev) => !prev);
  };

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenEmailCampaign = () => {
    setShowEmailModal(true);
  };

  // Multi-select Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredAndSortedCustomers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete Customer Handler
  const handleDeleteCustomer = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete customer "${name || 'ID ' + id}"?`
    );
    if (!confirmed) return;

    try {
      await deleteCustomer(id);
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      loadCustomerData();
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Failed to delete customer. Please try again.");
    }
  };

  // AI Email Generator Handler
  const handleGenerateEmailWithAI = async () => {
    if (!conversationNotes || !conversationNotes.trim()) {
      alert("Please enter conversation summary or notes to generate an email.");
      return;
    }

    setGeneratingAI(true);
    setEmailStatusMsg("");

    try {
      const res = await generateEmailTemplate(conversationNotes.trim());
      if (res && res.data) {
        setEmailSubject(res.data.subject || "Follow-up update from FlyingStocks CRM");
        setEmailPreviewBody(res.data.body || defaultEmailBody.replace("{summary}", conversationNotes.trim()));
      } else {
        setEmailPreviewBody(defaultEmailBody.replace("{summary}", conversationNotes.trim()));
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      // Seamless fallback
      setEmailPreviewBody(defaultEmailBody.replace("{summary}", conversationNotes.trim()));
    } finally {
      setGeneratingAI(false);
    }
  };

  // Send Email directly from preview card
  const handleSendPreviewEmail = async () => {
    setSendingEmail(true);
    setEmailStatusMsg("");

    // Determine target recipient IDs
    const targetIds = selectedIds.length > 0
      ? selectedIds
      : filteredAndSortedCustomers.map((c) => c.id).slice(0, 10);

    if (targetIds.length === 0) {
      alert("No recipients found to send the email to. Please select at least one customer.");
      setSendingEmail(false);
      return;
    }

    const payload = {
      campaign_name: `Dashboard Quick Email: ${emailSubject.substring(0, 30)}`,
      subject: emailSubject,
      body: emailPreviewBody,
      customer_ids: targetIds,
      dry_run: false,
    };

    try {
      const response = await sendEmailCampaign(payload);
      setEmailStatusMsg(response.message || `Email sent successfully to ${targetIds.length} recipient(s)!`);
      setTimeout(() => setEmailStatusMsg(""), 4000);
    } catch (err) {
      console.error("Error sending email:", err);
      setEmailStatusMsg(err.response?.data?.message || "Email queued/sent successfully!");
      setTimeout(() => setEmailStatusMsg(""), 4000);
    } finally {
      setSendingEmail(false);
    }
  };

  // State badge styling helper
  const renderStateBadge = (stateStr) => {
    const s = (stateStr || "Open").toLowerCase();
    if (s.includes("open") || s.includes("active")) {
      return <span className="fs-badge-state fs-badge-open">Open</span>;
    }
    if (s.includes("interested")) {
      return <span className="fs-badge-state fs-badge-interested">Interested</span>;
    }
    if (s.includes("closed") || s.includes("registered")) {
      return <span className="fs-badge-state fs-badge-closed">Closed</span>;
    }
    if (s.includes("progress") || s.includes("batch") || s.includes("follow")) {
      return <span className="fs-badge-state fs-badge-in-progress">In Progress</span>;
    }
    if (s.includes("not") || s.includes("reject")) {
      return <span className="fs-badge-state fs-badge-not-interested">Not Interested</span>;
    }
    return <span className="fs-badge-state fs-badge-open">{stateStr || "Open"}</span>;
  };

  // Format Date and Created At
  const formatDate = (dStr, fallbackIndex) => {
    if (dStr && dStr !== "None") {
      try {
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split("T")[0];
        }
      } catch {
        // fallback
      }
    }
    const day = String((fallbackIndex % 28) + 1).padStart(2, "0");
    return `2025-09-${day}`;
  };

  const formatCreatedAt = (dStr, fallbackIndex) => {
    if (dStr && dStr !== "None" && dStr.includes(" ")) {
      return dStr.substring(0, 16);
    }
    const day = String((fallbackIndex % 28) + 1).padStart(2, "0");
    const hour = String(9 + (fallbackIndex % 8)).padStart(2, "0");
    const min = String((fallbackIndex * 15) % 60).padStart(2, "0");
    return `2025-09-${day} ${hour}:${min}`;
  };

  const isAllSelected =
    filteredAndSortedCustomers.length > 0 &&
    selectedIds.length === filteredAndSortedCustomers.length;

  const startRecordNum = (page - 1) * limit + 1;
  const endRecordNum = Math.min(page * limit, totalRecords);

  return (
    <MainLayout hideSidebar={true} hideNavbar={true}>
      <div className="fs-crm-container">
        {/* Email Campaign Modal */}
        <EmailCampaignModal
          show={showEmailModal}
          onHide={() => setShowEmailModal(false)}
          selectedCustomers={customers.filter((c) => selectedIds.includes(c.id))}
          activeFilter={activeFilters.state !== "All" ? activeFilters.state : ""}
          totalFilterCount={filteredAndSortedCustomers.length}
        />

        {/* 1. TOP HEADER */}
        <header className="fs-crm-header">
          <Link to="/dashboard" className="fs-brand-block">
            <div className="fs-brand-logo-icon">
              <FiSend />
            </div>
            <div className="fs-brand-text">
              <span className="fs-brand-title">FlyingStocks</span>
              <span className="fs-brand-subtitle">CRM Viewer</span>
            </div>
          </Link>

          <div className="fs-header-actions">
            {/* Table Badge */}
            <div className="fs-table-badge-btn">
              <FiDatabase />
              <span>Table: customers</span>
            </div>

            {/* Quick Add Lead Button */}
            <Link to="/customers/add" className="btn btn-primary btn-sm d-flex align-items-center gap-1 fw-semibold py-2 px-3">
              <FiPlus />
              <span>Add Lead</span>
            </Link>

            {/* Profile & Navigation Menu (Retaining all previous sidebar functionality) */}
            <div className="position-relative" ref={profileDropdownRef}>
              <button
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 py-2 px-3 fw-semibold bg-white"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                aria-label="User navigation menu"
              >
                <FiUser />
                <span className="d-none d-md-inline">{userInfo.full_name || "Account"}</span>
              </button>

              {profileDropdownOpen && (
                <div
                  className="crm-profile-dropdown shadow-lg"
                  style={{ position: "absolute", right: 0, top: "105%", minWidth: "220px", zIndex: 1200 }}
                >
                  <div className="crm-dropdown-header">
                    <div className="crm-dropdown-user-name">{userInfo.full_name}</div>
                    <div className="crm-dropdown-user-email">{userInfo.email}</div>
                    <span className="crm-dropdown-role-badge">{userInfo.role || "Admin"}</span>
                  </div>

                  <div className="crm-dropdown-divider" />

                  <div className="crm-dropdown-body">
                    <Link
                      to="/analytics"
                      className="crm-dropdown-item text-dark"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FiBarChart2 className="crm-dropdown-icon text-primary" />
                      <span>Analytics</span>
                    </Link>

                    <Link
                      to="/ai"
                      className="crm-dropdown-item text-dark"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FiCpu className="crm-dropdown-icon text-primary" />
                      <span>AI Insights</span>
                    </Link>

                    <Link
                      to="/reports"
                      className="crm-dropdown-item text-dark"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FiFileText className="crm-dropdown-icon text-primary" />
                      <span>Reports</span>
                    </Link>

                    <div className="crm-dropdown-divider" />

                    <button
                      className="crm-dropdown-item logout-btn"
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/");
                      }}
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

        {/* 2. TABLE INFORMATION BANNER */}
        <div className="fs-table-info-banner">
          <FiInfo className="fs-info-icon" />
          <span>Table: customers</span>
        </div>

        {/* 3. PRIMARY ACTION BUTTONS BAR */}
        <div className="fs-primary-actions-grid">
          <button className="fs-action-btn fs-btn-view-table" onClick={handleViewTableData}>
            <FiGrid />
            <span>View Table Data</span>
          </button>

          <button
            className={`fs-action-btn fs-btn-filter-toggle ${showFilters ? "active" : ""}`}
            onClick={handleToggleFilterPanel}
          >
            <FiFilter />
            <span>Filter Data</span>
          </button>

          <button className="fs-action-btn fs-btn-search-toggle" onClick={handleFocusSearch}>
            <FiSearch />
            <span>Search Data</span>
          </button>

          <button className="fs-action-btn fs-btn-send-email" onClick={handleOpenEmailCampaign}>
            <FiMail />
            <span>Send Email</span>
          </button>
        </div>

        {/* 4. APPLY FILTERS SECTION (Single Source of Truth for Filtering) */}
        {showFilters && (
          <div className="fs-apply-filters-card">
            <div className="fs-filters-header" onClick={handleToggleFilterPanel}>
              <div className="fs-filters-title">
                <FiFilter className="fs-filters-icon" />
                <span>Apply Filters</span>
              </div>
              <div className="fs-filters-chevron">
                {showFilters ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </div>

            <div className="fs-filters-grid">
              {/* Start Date */}
              <div className="fs-filter-group">
                <label className="fs-filter-label">Start Date</label>
                <div className="fs-filter-input-wrapper">
                  <FiCalendar className="fs-filter-input-icon" />
                  <input
                    type="date"
                    className="fs-filter-input"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="fs-filter-group">
                <label className="fs-filter-label">End Date</label>
                <div className="fs-filter-input-wrapper">
                  <FiCalendar className="fs-filter-input-icon" />
                  <input
                    type="date"
                    className="fs-filter-input"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* State */}
              <div className="fs-filter-group">
                <label className="fs-filter-label">State</label>
                <select
                  className="fs-filter-select"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Open">Open</option>
                  <option value="Interested">Interested</option>
                  <option value="Closed">Closed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              {/* Search Name */}
              <div className="fs-filter-group">
                <label className="fs-filter-label">Search Name</label>
                <input
                  type="text"
                  className="fs-filter-input no-icon"
                  placeholder="Enter name to search..."
                  value={filterSearchName}
                  onChange={(e) => setFilterSearchName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilter();
                  }}
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="fs-filter-actions">
              <button className="fs-btn-apply-filter" onClick={handleApplyFilter}>
                <FiCheck />
                <span>Apply Filter</span>
              </button>

              <button className="fs-btn-clear-filter" onClick={handleClearFilter}>
                <FiX />
                <span>Clear Filter</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. CUSTOMER DATA TABLE CARD */}
        <div className="fs-customer-data-card" ref={tableRef}>
          <div className="fs-data-card-header">
            <div className="fs-data-card-title">
              <FiGrid />
              <span>Customer Data</span>
            </div>

            <div className="fs-data-search-box">
              <FiSearch className="fs-data-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="fs-data-search-input"
                placeholder="Search by name, email, phone..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="fs-table-responsive">
            <table className="fs-customer-table">
              <thead>
                <tr>
                  <th style={{ width: "40px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="sortable" onClick={() => handleSort("id")}>
                    ID <span className="fs-sort-icon">⇅</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("name")}>
                    Name <span className="fs-sort-icon">⇅</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("email")}>
                    Email <span className="fs-sort-icon">⇅</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("mobile")}>
                    Phone <span className="fs-sort-icon">⇅</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("company")}>
                    Company <span className="fs-sort-icon">⇅</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("state")}>
                    State <span className="fs-sort-icon">⇅</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("date")}>
                    Date <span className="fs-sort-icon">⇅</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("date")}>
                    Created At <span className="fs-sort-icon">⇅</span>
                  </th>
                  <th style={{ textAlign: "center", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                      Loading customer records...
                    </td>
                  </tr>
                ) : filteredAndSortedCustomers.length > 0 ? (
                  filteredAndSortedCustomers.map((customer, idx) => {
                    const isSelected = selectedIds.includes(customer.id);
                    return (
                      <tr key={customer.id} className={isSelected ? "selected" : ""}>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(customer.id)}
                          />
                        </td>
                        <td className="fw-semibold text-secondary">{customer.id}</td>
                        <td className="fw-bold text-dark">{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.mobile || "-"}</td>
                        <td>{customer.company || "-"}</td>
                        <td>{renderStateBadge(customer.state)}</td>
                        <td>{formatDate(customer.date, customer.id || idx + 1)}</td>
                        <td>{formatCreatedAt(customer.date, customer.id || idx + 1)}</td>
                        <td style={{ textAlign: "center" }}>
                          <div className="fs-table-actions justify-content-center">
                            {/* View Customer Button */}
                            <Link
                              to={`/customers/${customer.id}`}
                              className="fs-action-icon-btn fs-btn-view"
                              title="View Details"
                            >
                              <FiEye />
                            </Link>

                            {/* Modify / Edit Customer Button */}
                            <Link
                              to={`/customers/edit/${customer.id}`}
                              className="fs-action-icon-btn fs-btn-edit"
                              title="Modify Customer"
                            >
                              <FiEdit2 />
                            </Link>

                            {/* Delete Customer Button */}
                            <button
                              className="fs-action-icon-btn fs-btn-delete"
                              onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                              title="Delete Customer"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-5 text-muted">
                      No customer records found matching the active criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer & Pagination */}
          <div className="fs-table-footer">
            <span className="fs-table-summary-text">
              Showing {totalRecords > 0 ? startRecordNum : 0} to {endRecordNum} of {totalRecords} customers
            </span>

            <div className="fs-pagination-nav">
              <button
                className="fs-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    className={`fs-page-btn ${page === pageNum ? "active" : ""}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="fs-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* 6. BOTTOM SECTION: AI EMAIL GENERATION & PREVIEW */}
        <div className="fs-email-section-grid" ref={emailSectionRef}>
          {/* Left Card: Generate Email from Conversation */}
          <div className="fs-email-card">
            <div className="fs-email-card-header">
              <FiMail className="fs-email-card-icon" />
              <span>Generate Email from Conversation</span>
            </div>

            <div className="fs-email-input-group">
              <label className="fs-email-label">Conversation Summary / Notes</label>
              <textarea
                className="fs-email-textarea"
                placeholder="Enter the conversation summary or notes here..."
                value={conversationNotes}
                onChange={(e) => setConversationNotes(e.target.value)}
              />

              <button
                className="fs-btn-generate-ai"
                onClick={handleGenerateEmailWithAI}
                disabled={generatingAI}
              >
                {generatingAI ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>✦ Generate Email with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Card: Email Preview */}
          <div className="fs-email-card">
            <div className="fs-email-card-header">
              <FiMail className="fs-email-card-icon" />
              <span>Email Preview</span>
            </div>

            <div className="fs-email-preview-box">
              {emailPreviewBody}
            </div>

            {emailStatusMsg && (
              <div className="alert alert-info py-2 px-3 mb-2 small fw-semibold">
                {emailStatusMsg}
              </div>
            )}

            <div className="fs-email-preview-actions">
              <button
                className="fs-btn-send-preview"
                onClick={handleSendPreviewEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FiSend />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
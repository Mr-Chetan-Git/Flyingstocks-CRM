
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getCustomers,
  searchCustomers,
  deleteCustomer,
} from "../api/customerApi";

import {
  generateEmailTemplate,
  sendEmailCampaign,
} from "../api/emailApi";

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
  FiUser,
} from "react-icons/fi";

const PAGE_SIZE = 50;

export default function Dashboard() {
  const navigate = useNavigate();

  const searchInputRef = useRef(null);
  const tableRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // =====================================
  // CUSTOMER DATA AND PAGINATION
  // =====================================

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // =====================================
  // SORTING
  // =====================================

  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // =====================================
  // ROW SELECTION
  // =====================================

  const [selectedIds, setSelectedIds] = useState([]);

  // =====================================
  // FILTER FORM
  // =====================================

  const [showFilters, setShowFilters] = useState(true);

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterState, setFilterState] = useState("All");
  const [filterSearchName, setFilterSearchName] = useState("");

  const [activeFilters, setActiveFilters] = useState({
    startDate: "",
    endDate: "",
    state: "All",
    searchName: "",
  });

  // =====================================
  // QUICK SEARCH
  // =====================================

  const [tableSearch, setTableSearch] = useState("");

  // =====================================
  // PROFILE DROPDOWN
  // =====================================

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // =====================================
  // EMAIL CAMPAIGN
  // =====================================

  const [showEmailModal, setShowEmailModal] = useState(false);

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

  const [emailPreviewBody, setEmailPreviewBody] =
    useState(defaultEmailBody);

  const [emailSubject, setEmailSubject] = useState(
    "Update from FlyingStocks CRM Team"
  );

  // =====================================
  // USER INFORMATION
  // =====================================

  const getUserInfo = () => {
    try {
      const user = localStorage.getItem("user");

      if (user) {
        return JSON.parse(user);
      }
    } catch (error) {
      console.error("Unable to read user information:", error);
    }

    return {
      full_name: "Admin User",
      email: "admin@flyingstocks.com",
      role: "Administrator",
    };
  };

  const userInfo = getUserInfo();

  // =====================================
  // LOAD CUSTOMER DATA
  // =====================================

  const loadCustomerData = useCallback(async () => {
    setLoading(true);

    try {
      let result;

      if (tableSearch.trim()) {
        result = await searchCustomers(
          tableSearch.trim(),
          page,
          PAGE_SIZE
        );
      } else {
        result = await getCustomers(page, PAGE_SIZE, {
          startDate: activeFilters.startDate,
          endDate: activeFilters.endDate,
          state: activeFilters.state,
          searchName: activeFilters.searchName,
        });
      }

      const records = Array.isArray(result?.customers)
        ? result.customers
        : [];

      setCustomers(records);

      setTotalRecords(Number(result?.total_records) || 0);

      setTotalPages(
        Math.max(Number(result?.total_pages) || 1, 1)
      );

      // Remove selections for records no longer on the current page.
      setSelectedIds((previousIds) =>
        previousIds.filter((id) =>
          records.some((customer) => customer.id === id)
        )
      );
    } catch (error) {
      console.error("Error loading customers:", error);

      setCustomers([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    tableSearch,
    activeFilters.startDate,
    activeFilters.endDate,
    activeFilters.state,
    activeFilters.searchName,
  ]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  // =====================================
  // CLOSE PROFILE DROPDOWN
  // =====================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =====================================
  // DATE HELPERS
  // =====================================

  const getCustomerDate = (customer) => {
  return (
    customer.created_at ||
    customer.createdAt ||
    customer.created_on ||
    customer.createdOn ||
    customer.created_date ||
    customer.createdDate ||
    customer.date ||
    customer.lead_date ||
    customer.leadDate ||
    null
  );
};

  const formatDate = (dateValue) => {
    if (!dateValue || dateValue === "None") {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toISOString().split("T")[0];
  };

  const formatCreatedAt = (dateValue) => {
    if (!dateValue || dateValue === "None") {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toISOString().replace("T", " ").slice(0, 16);
  };

  // =====================================
  // SORT CUSTOMER DATA
  // =====================================

  const filteredAndSortedCustomers = useMemo(() => {
    const result = [...customers];

    result.sort((customerA, customerB) => {
      let valueA;
      let valueB;

      if (
        sortColumn === "created_at" ||
        sortColumn === "date"
      ) {
        valueA = new Date(
          getCustomerDate(customerA) || 0
        ).getTime();

        valueB = new Date(
          getCustomerDate(customerB) || 0
        ).getTime();

        if (Number.isNaN(valueA)) valueA = 0;
        if (Number.isNaN(valueB)) valueB = 0;
      } else if (sortColumn === "id") {
        valueA = Number(customerA.id) || 0;
        valueB = Number(customerB.id) || 0;
      } else {
        valueA = String(customerA[sortColumn] || "")
          .toLowerCase();

        valueB = String(customerB[sortColumn] || "")
          .toLowerCase();
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

    return result;
  }, [customers, sortColumn, sortDirection]);

  // =====================================
  // SORT HANDLER
  // =====================================

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((previous) =>
        previous === "asc" ? "desc" : "asc"
      );
    } else {
      setSortColumn(column);

      // Date/time and ID default to newest/largest first.
      if (column === "created_at" || column === "date" || column === "id") {
        setSortDirection("desc");
      } else {
        setSortDirection("asc");
      }
    }
  };

  // =====================================
  // APPLY FILTER
  // =====================================

  const handleApplyFilter = () => {
    if (
      filterStartDate &&
      filterEndDate &&
      filterStartDate > filterEndDate
    ) {
      alert("Start Date cannot be after End Date.");
      return;
    }

    setPage(1);

    setActiveFilters({
      startDate: filterStartDate,
      endDate: filterEndDate,
      state: filterState,
      searchName: filterSearchName.trim(),
    });
  };

  // =====================================
  // CLEAR FILTERS
  // =====================================

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
    setPage(1);
    setSelectedIds([]);
  };

  // =====================================
  // VIEW TABLE DATA
  // =====================================

  const handleViewTableData = () => {
    handleClearFilter();

    tableRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // =====================================
  // SEARCH HANDLERS
  // =====================================

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();

    tableRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleTableSearchChange = (event) => {
    setTableSearch(event.target.value);
    setPage(1);
  };

  // =====================================
  // EMAIL CAMPAIGN MODAL
  // =====================================

  const handleOpenEmailCampaign = () => {
    setShowEmailModal(true);
  };

  // =====================================
  // SELECT ROWS
  // =====================================

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(
        filteredAndSortedCustomers.map((customer) => customer.id)
      );
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((previousIds) =>
      previousIds.includes(id)
        ? previousIds.filter((item) => item !== id)
        : [...previousIds, id]
    );
  };

  const isAllSelected =
    filteredAndSortedCustomers.length > 0 &&
    filteredAndSortedCustomers.every((customer) =>
      selectedIds.includes(customer.id)
    );

  // =====================================
  // DELETE CUSTOMER
  // =====================================

  const handleDeleteCustomer = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete customer "${name || `ID ${id}`}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCustomer(id);

      setSelectedIds((previousIds) =>
        previousIds.filter((item) => item !== id)
      );

      await loadCustomerData();
    } catch (error) {
      console.error("Error deleting customer:", error);

      alert("Failed to delete customer. Please try again.");
    }
  };

  // =====================================
  // GENERATE EMAIL WITH AI
  // =====================================

  const handleGenerateEmailWithAI = async () => {
    if (!conversationNotes.trim()) {
      alert(
        "Please enter conversation summary or notes to generate an email."
      );

      return;
    }

    setGeneratingAI(true);
    setEmailStatusMsg("");

    try {
      const response = await generateEmailTemplate(
        conversationNotes.trim()
      );

      const result = response?.data ?? response;

      if (result) {
        setEmailSubject(
          result.subject ||
            "Follow-up update from FlyingStocks CRM"
        );

        setEmailPreviewBody(
          result.body ||
            defaultEmailBody.replace(
              "{summary}",
              conversationNotes.trim()
            )
        );
      } else {
        setEmailPreviewBody(
          defaultEmailBody.replace(
            "{summary}",
            conversationNotes.trim()
          )
        );
      }
    } catch (error) {
      console.error("AI email generation error:", error);

      setEmailPreviewBody(
        defaultEmailBody.replace(
          "{summary}",
          conversationNotes.trim()
        )
      );

      setEmailStatusMsg(
        "AI email generation failed. A standard email template is shown."
      );
    } finally {
      setGeneratingAI(false);
    }
  };

  // =====================================
  // SEND EMAIL
  // =====================================

  const handleSendPreviewEmail = async () => {
    const targetIds =
      selectedIds.length > 0
        ? selectedIds
        : filteredAndSortedCustomers
            .map((customer) => customer.id)
            .slice(0, 10);

    if (targetIds.length === 0) {
      alert(
        "No recipients found. Please select at least one customer."
      );

      return;
    }

    const confirmed = window.confirm(
      `Send this email to ${targetIds.length} selected customer(s)?`
    );

    if (!confirmed) {
      return;
    }

    setSendingEmail(true);
    setEmailStatusMsg("");

    const payload = {
      campaign_name: `Dashboard Quick Email: ${emailSubject.substring(
        0,
        30
      )}`,
      subject: emailSubject,
      body: emailPreviewBody,
      customer_ids: targetIds,
      dry_run: false,
    };

    try {
      const response = await sendEmailCampaign(payload);

      setEmailStatusMsg(
        response?.message ||
          `Email request completed for ${targetIds.length} recipient(s).`
      );
    } catch (error) {
      console.error("Error sending email:", error);

      setEmailStatusMsg(
        error.response?.data?.message ||
          "Failed to send email. Please try again."
      );
    } finally {
      setSendingEmail(false);

      setTimeout(() => {
        setEmailStatusMsg("");
      }, 5000);
    }
  };

  // =====================================
  // STATE BADGE
  // =====================================

  const renderStateBadge = (stateValue) => {
    const state = String(stateValue || "Open").toLowerCase();

    if (state.includes("open") || state.includes("active")) {
      return (
        <span className="fs-badge-state fs-badge-open">
          Open
        </span>
      );
    }

    if (state.includes("interested")) {
      return (
        <span className="fs-badge-state fs-badge-interested">
          Interested
        </span>
      );
    }

    if (
      state.includes("closed") ||
      state.includes("registered")
    ) {
      return (
        <span className="fs-badge-state fs-badge-closed">
          Closed
        </span>
      );
    }

    if (
      state.includes("progress") ||
      state.includes("batch") ||
      state.includes("follow")
    ) {
      return (
        <span className="fs-badge-state fs-badge-in-progress">
          In Progress
        </span>
      );
    }

    if (
      state.includes("not") ||
      state.includes("reject")
    ) {
      return (
        <span className="fs-badge-state fs-badge-not-interested">
          Not Interested
        </span>
      );
    }

    return (
      <span className="fs-badge-state fs-badge-open">
        {stateValue || "Open"}
      </span>
    );
  };

  // =====================================
  // PAGINATION DISPLAY
  // =====================================

  const startRecordNum =
    totalRecords > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;

  const endRecordNum = Math.min(
    page * PAGE_SIZE,
    totalRecords
  );

  const pageNumbers = Array.from(
    {
      length: Math.min(totalPages, 5),
    },
    (_, index) => index + 1
  );

  // =====================================
  // RENDER
  // =====================================

  return (
    <MainLayout hideSidebar={true} hideNavbar={true}>
      <div className="fs-crm-container">
        {/* EMAIL CAMPAIGN MODAL */}

        <EmailCampaignModal
          show={showEmailModal}
          onHide={() => setShowEmailModal(false)}
          selectedCustomers={customers.filter((customer) =>
            selectedIds.includes(customer.id)
          )}
          activeFilter={
            activeFilters.state !== "All"
              ? activeFilters.state
              : ""
          }
          totalFilterCount={totalRecords}
        />

        {/* HEADER */}

        <header className="fs-crm-header">
          <Link to="/dashboard" className="fs-brand-block">
            <div className="fs-brand-logo-icon">
              <FiSend />
            </div>

            <div className="fs-brand-text">
              <span className="fs-brand-title">
                FlyingStocks
              </span>

              <span className="fs-brand-subtitle">
                CRM Viewer
              </span>
            </div>
          </Link>

          <div className="fs-header-actions">
            <div className="fs-table-badge-btn">
              <FiDatabase />
              <span>Table: customers</span>
            </div>

            <Link
              to="/customers/add"
              className="btn btn-primary btn-sm d-flex align-items-center gap-1 fw-semibold py-2 px-3"
            >
              <FiPlus />
              <span>Add Lead</span>
            </Link>

            {/* PROFILE MENU */}

            <div
              className="position-relative"
              ref={profileDropdownRef}
            >
              <button
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 py-2 px-3 fw-semibold bg-white"
                onClick={() =>
                  setProfileDropdownOpen((previous) => !previous)
                }
                aria-label="User navigation menu"
              >
                <FiUser />

                <span className="d-none d-md-inline">
                  {userInfo.full_name || "Account"}
                </span>
              </button>

              {profileDropdownOpen && (
                <div
                  className="crm-profile-dropdown shadow-lg"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "105%",
                    minWidth: "220px",
                    zIndex: 1200,
                  }}
                >
                  <div className="crm-dropdown-header">
                    <div className="crm-dropdown-user-name">
                      {userInfo.full_name}
                    </div>

                    <div className="crm-dropdown-user-email">
                      {userInfo.email}
                    </div>

                    <span className="crm-dropdown-role-badge">
                      {userInfo.role || "Admin"}
                    </span>
                  </div>

                  <div className="crm-dropdown-divider" />

                  <div className="crm-dropdown-body">
                    <Link
                      to="/analytics"
                      className="crm-dropdown-item text-dark"
                      onClick={() =>
                        setProfileDropdownOpen(false)
                      }
                    >
                      <FiBarChart2 className="crm-dropdown-icon text-primary" />
                      <span>Analytics</span>
                    </Link>

                    <Link
                      to="/ai"
                      className="crm-dropdown-item text-dark"
                      onClick={() =>
                        setProfileDropdownOpen(false)
                      }
                    >
                      <FiCpu className="crm-dropdown-icon text-primary" />
                      <span>AI Insights</span>
                    </Link>

                    <Link
                      to="/reports"
                      className="crm-dropdown-item text-dark"
                      onClick={() =>
                        setProfileDropdownOpen(false)
                      }
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

        {/* TABLE INFORMATION */}

        <div className="fs-table-info-banner">
          <FiInfo className="fs-info-icon" />
          <span>Table: customers</span>
        </div>

        {/* PRIMARY ACTION BUTTONS */}

        <div className="fs-primary-actions-grid">
          <button
            className="fs-action-btn fs-btn-view-table"
            onClick={handleViewTableData}
          >
            <FiGrid />
            <span>View Table Data</span>
          </button>

          <button
            className={`fs-action-btn fs-btn-filter-toggle ${
              showFilters ? "active" : ""
            }`}
            onClick={() =>
              setShowFilters((previous) => !previous)
            }
          >
            <FiFilter />
            <span>Filter Data</span>
          </button>

          <button
            className="fs-action-btn fs-btn-search-toggle"
            onClick={handleFocusSearch}
          >
            <FiSearch />
            <span>Search Data</span>
          </button>

          <button
            className="fs-action-btn fs-btn-send-email"
            onClick={handleOpenEmailCampaign}
          >
            <FiMail />
            <span>Send Email</span>
          </button>
        </div>

        {/* FILTER PANEL */}

        {showFilters && (
          <div className="fs-apply-filters-card">
            <div
              className="fs-filters-header"
              onClick={() =>
                setShowFilters((previous) => !previous)
              }
            >
              <div className="fs-filters-title">
                <FiFilter className="fs-filters-icon" />
                <span>Apply Filters</span>
              </div>

              <div className="fs-filters-chevron">
                <FiChevronUp />
              </div>
            </div>

            <div className="fs-filters-grid">
              {/* START DATE */}

              <div className="fs-filter-group">
                <label className="fs-filter-label">
                  Start Date
                </label>

                <div className="fs-filter-input-wrapper">
                  <FiCalendar className="fs-filter-input-icon" />

                  <input
                    type="date"
                    className="fs-filter-input"
                    value={filterStartDate}
                    onChange={(event) =>
                      setFilterStartDate(event.target.value)
                    }
                  />
                </div>
              </div>

              {/* END DATE */}

              <div className="fs-filter-group">
                <label className="fs-filter-label">
                  End Date
                </label>

                <div className="fs-filter-input-wrapper">
                  <FiCalendar className="fs-filter-input-icon" />

                  <input
                    type="date"
                    className="fs-filter-input"
                    value={filterEndDate}
                    onChange={(event) =>
                      setFilterEndDate(event.target.value)
                    }
                  />
                </div>
              </div>

              {/* STATE */}

              <div className="fs-filter-group">
                <label className="fs-filter-label">
                  State
                </label>

                <select
                  className="fs-filter-select"
                  value={filterState}
                  onChange={(event) =>
                    setFilterState(event.target.value)
                  }
                >
                  <option value="All">All</option>
                  <option value="Open">Open</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Interested">Interested</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {/* NAME */}

              <div className="fs-filter-group">
                <label className="fs-filter-label">
                  Search Name
                </label>

                <input
                  type="text"
                  className="fs-filter-input no-icon"
                  placeholder="Enter name to search..."
                  value={filterSearchName}
                  onChange={(event) =>
                    setFilterSearchName(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleApplyFilter();
                    }
                  }}
                />
              </div>
            </div>

            {/* FILTER BUTTONS */}

            <div className="fs-filter-actions">
              <button
                className="fs-btn-apply-filter"
                onClick={handleApplyFilter}
              >
                <FiCheck />
                <span>Apply Filter</span>
              </button>

              <button
                className="fs-btn-clear-filter"
                onClick={handleClearFilter}
              >
                <FiX />
                <span>Clear Filter</span>
              </button>
            </div>
          </div>
        )}

        {/* CUSTOMER TABLE */}

        <div
          className="fs-customer-data-card"
          ref={tableRef}
        >
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
                onChange={handleTableSearchChange}
              />
            </div>
          </div>

          <div className="fs-table-responsive">
            <table className="fs-customer-table">
              <thead>
                <tr>
                  <th
                    style={{
                      width: "40px",
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>

                  <th
                    className="sortable"
                    onClick={() => handleSort("id")}
                  >
                    ID <span className="fs-sort-icon">⇅</span>
                  </th>

                  <th
                    className="sortable"
                    onClick={() => handleSort("name")}
                  >
                    Name <span className="fs-sort-icon">⇅</span>
                  </th>

                  <th
                    className="sortable"
                    onClick={() => handleSort("email")}
                  >
                    Email <span className="fs-sort-icon">⇅</span>
                  </th>

                  <th
                    className="sortable"
                    onClick={() => handleSort("mobile")}
                  >
                    Phone <span className="fs-sort-icon">⇅</span>
                  </th>

                  <th
                    className="sortable"
                    onClick={() => handleSort("company")}
                  >
                    Company <span className="fs-sort-icon">⇅</span>
                  </th>

                  <th
                    className="sortable"
                    onClick={() => handleSort("state")}
                  >
                    State <span className="fs-sort-icon">⇅</span>
                  </th>

                  <th
                    className="sortable"
                    onClick={() => handleSort("date")}
                  >
                    Date <span className="fs-sort-icon">⇅</span>
                  </th>

                  <th
                    className="sortable"
                    onClick={() => handleSort("created_at")}
                  >
                    Created At <span className="fs-sort-icon">⇅</span>
                  </th>

                  <th
                    style={{
                      textAlign: "center",
                      width: "120px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center py-5 text-muted"
                    >
                      <div
                        className="spinner-border spinner-border-sm text-primary me-2"
                        role="status"
                      />

                      Loading customer records...
                    </td>
                  </tr>
                ) : filteredAndSortedCustomers.length > 0 ? (
                  filteredAndSortedCustomers.map((customer) => {
                    const isSelected = selectedIds.includes(
                      customer.id
                    );

                    const customerDate = getCustomerDate(customer);

                    return (
                      <tr
                        key={customer.id}
                        className={isSelected ? "selected" : ""}
                      >
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleSelectRow(customer.id)
                            }
                          />
                        </td>

                        <td className="fw-semibold text-secondary">
                          {customer.id}
                        </td>

                        <td className="fw-bold text-dark">
                          {customer.name || "—"}
                        </td>

                        <td>{customer.email || "—"}</td>

                        <td>{customer.mobile || "—"}</td>

                        <td>{customer.company || "—"}</td>

                        <td>
                          {renderStateBadge(customer.state)}
                        </td>

                        <td>
                          {formatDate(customer.date)}
                        </td>

                        <td>
                          {formatCreatedAt(customerDate)}
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <div className="fs-table-actions justify-content-center">
                            {/* VIEW */}

                            <Link
                              to={`/customers/${customer.id}`}
                              className="fs-action-icon-btn fs-btn-view"
                              title="View Details"
                            >
                              <FiEye />
                            </Link>

                            {/* MODIFY */}

                            <Link
                              to={`/customers/edit/${customer.id}`}
                              className="fs-action-icon-btn fs-btn-edit"
                              title="Modify Customer"
                            >
                              <FiEdit2 />
                            </Link>

                            {/* DELETE */}

                            <button
                              className="fs-action-icon-btn fs-btn-delete"
                              onClick={() =>
                                handleDeleteCustomer(
                                  customer.id,
                                  customer.name
                                )
                              }
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
                    <td
                      colSpan="10"
                      className="text-center py-5 text-muted"
                    >
                      No customer records found matching the active criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="fs-table-footer">
            <span className="fs-table-summary-text">
              Showing {startRecordNum} to {endRecordNum} of{" "}
              {totalRecords} customers
            </span>

            <div className="fs-pagination-nav">
              <button
                className="fs-page-btn"
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((previous) =>
                    Math.max(previous - 1, 1)
                  )
                }
              >
                Previous
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`fs-page-btn ${
                    page === pageNumber ? "active" : ""
                  }`}
                  disabled={loading}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                className="fs-page-btn"
                disabled={page >= totalPages || loading}
                onClick={() =>
                  setPage((previous) =>
                    Math.min(previous + 1, totalPages)
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* AI EMAIL GENERATION AND PREVIEW */}

        <div className="fs-email-section-grid">
          {/* GENERATE EMAIL */}

          <div className="fs-email-card">
            <div className="fs-email-card-header">
              <FiMail className="fs-email-card-icon" />
              <span>Generate Email from Conversation</span>
            </div>

            <div className="fs-email-input-group">
              <label className="fs-email-label">
                Conversation Summary / Notes
              </label>

              <textarea
                className="fs-email-textarea"
                placeholder="Enter the conversation summary or notes here..."
                value={conversationNotes}
                onChange={(event) =>
                  setConversationNotes(event.target.value)
                }
              />

              <button
                className="fs-btn-generate-ai"
                onClick={handleGenerateEmailWithAI}
                disabled={generatingAI}
              >
                {generatingAI ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />

                    <span>Generating...</span>
                  </>
                ) : (
                  <span>✦ Generate Email with AI</span>
                )}
              </button>
            </div>
          </div>

          {/* EMAIL PREVIEW */}

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
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />

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

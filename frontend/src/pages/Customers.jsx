import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
    getCustomers,
    searchCustomers,
    deleteCustomer,
} from "../api/customerApi";

import { Table, Button, Form, Row, Col, Badge, Card } from "react-bootstrap";
import MainLayout from "../layouts/MainLayout";
import EmailCampaignModal from "../components/EmailCampaignModal";
import { FiMail, FiPlus, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function Customers() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeFilter = searchParams.get("filter") || "";
    const activeQuery = searchParams.get("q") || "";

    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState(activeQuery);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Checkbox Selection & Modal States
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [showEmailModal, setShowEmailModal] = useState(false);

    // Sync local search input state when URL q param changes (e.g. Browser Back/Forward navigation)
    useEffect(() => {
        setSearch(activeQuery);
    }, [activeQuery]);

    // Helper to evaluate if customer record matches the current filter parameter
    const filterCustomerByState = useCallback((customer, filterParam) => {
        if (!filterParam) return true;
        const f = filterParam.toLowerCase();
        const st = (customer.state || customer.confirm_register || customer.prediction || "").toLowerCase();

        if (f === "interested") {
            return st.includes("interested");
        }
        if (f === "registered") {
            return st === "closed" || st === "registered" || st.includes("closed") || st.includes("registered");
        }
        if (f === "follow_up" || f === "followup") {
            return st.includes("next batch") || st.includes("follow up") || st.includes("follow_up");
        }
        return true;
    }, []);

    // Load and filter customer data based on page, activeFilter, and activeQuery
    const fetchAndFilterCustomers = useCallback(async () => {
        setLoading(true);
        try {
            let records = [];

            if (activeQuery.trim() !== "") {
                const searchResults = await searchCustomers(activeQuery);
                records = searchResults || [];
            } else {
                const data = await getCustomers(page);
                records = data?.customers || [];
                setTotalPages(data?.total_pages || 1);
            }

            const filteredRecords = records.filter(c => filterCustomerByState(c, activeFilter));
            setCustomers(filteredRecords);
        } catch (err) {
            console.error("Error fetching customers:", err);
        } finally {
            setLoading(false);
        }
    }, [page, activeFilter, activeQuery, filterCustomerByState]);

    useEffect(() => {
        fetchAndFilterCustomers();
    }, [fetchAndFilterCustomers]);

    // Handle real-time search input and sync with URL searchParams
    function handleSearchChange(e) {
        const val = typeof e === "string" ? e : e.target.value;
        setSearch(val);

        const newParams = {};
        if (activeFilter) newParams.filter = activeFilter;
        if (val.trim() !== "") newParams.q = val;

        setSearchParams(newParams);
    }

    // Checkbox Selection Logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedCustomerIds(customers.map((c) => c.id));
        } else {
            setSelectedCustomerIds([]);
        }
    };

    const handleSelectCustomer = (id) => {
        setSelectedCustomerIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Delete Customer
    async function handleDelete(id) {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this customer?"
        );

        if (!confirmDelete) return;

        try {
            await deleteCustomer(id);
            alert("Customer deleted successfully");
            fetchAndFilterCustomers();
        } catch (err) {
            console.error("Delete Customer Error:", err);
            alert("Failed to delete customer");
        }
    }

    // Determine Page Header Title based on active filter
    const getPageTitle = () => {
        if (activeFilter === "interested") return "Interested Customers";
        if (activeFilter === "registered") return "Registered Customers";
        if (activeFilter === "follow_up") return "Follow Up Customers";
        return "Customer Directory";
    };

    const selectedCustomerObjects = customers.filter((c) => selectedCustomerIds.includes(c.id));
    const isAllSelected = customers.length > 0 && selectedCustomerIds.length === customers.length;

    return (
        <MainLayout 
            title={getPageTitle()} 
            searchValue={search} 
            onSearch={handleSearchChange}
        >
            {/* Email Campaign Modal */}
            <EmailCampaignModal
                show={showEmailModal}
                onHide={() => setShowEmailModal(false)}
                selectedCustomers={selectedCustomerObjects}
                activeFilter={activeFilter}
                totalFilterCount={customers.length}
            />

            {/* Header Controls Row */}
            <Row className="mb-4 align-items-center g-3">
                <Col lg={4} md={12}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h2 className="m-0 fw-bold">{getPageTitle()}</h2>
                        {activeFilter && (
                            <Badge bg="primary" className="text-capitalize px-3 py-2 fs-6">
                                Filter: {activeFilter.replace("_", " ")}
                            </Badge>
                        )}
                    </div>
                </Col>

                <Col lg={4} md={6}>
                    <Form.Control
                        placeholder="Search customers..."
                        value={search}
                        onChange={handleSearchChange}
                        className="py-2"
                    />
                </Col>

                <Col lg={4} md={6} className="text-end d-flex justify-content-md-end justify-content-start gap-2 flex-wrap">
                    {/* Send Email Campaign Button */}
                    <Button
                        variant="outline-primary"
                        className="d-flex align-items-center gap-2 fw-semibold py-2"
                        onClick={() => setShowEmailModal(true)}
                    >
                        <FiMail />
                        <span>Send Email Campaign</span>
                        {selectedCustomerIds.length > 0 ? (
                            <Badge bg="primary" pill>{selectedCustomerIds.length}</Badge>
                        ) : activeFilter ? (
                            <Badge bg="secondary" pill>{activeFilter}</Badge>
                        ) : null}
                    </Button>

                    <Link
                        to="/customers/add"
                        className="btn btn-primary d-flex align-items-center gap-1 py-2 fw-semibold"
                    >
                        <FiPlus />
                        <span>Add Customer</span>
                    </Link>
                </Col>
            </Row>

            {/* Responsive Table Card Wrapper */}
            <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table striped hover className="align-middle mb-0 text-nowrap-sm">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: "40px" }} className="text-center px-3 py-3">
                                        <Form.Check
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th style={{ width: "50px" }} className="py-3">ID</th>
                                    <th style={{ minWidth: "120px" }} className="py-3">Name</th>
                                    <th style={{ minWidth: "160px" }} className="py-3">Email</th>
                                    <th style={{ minWidth: "140px" }} className="py-3">Company</th>
                                    <th style={{ minWidth: "120px" }} className="py-3">State / Status</th>
                                    <th style={{ minWidth: "100px" }} className="py-3">Prediction</th>
                                    <th style={{ width: "170px", minWidth: "170px" }} className="text-center py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            Loading Customers...
                                        </td>
                                    </tr>
                                ) : customers.length > 0 ? (
                                    customers.map((customer, index) => {
                                        const isSelected = selectedCustomerIds.includes(customer.id);
                                        return (
                                            <tr key={customer.id} className={isSelected ? "table-primary" : ""}>
                                                <td className="text-center px-3">
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectCustomer(customer.id)}
                                                    />
                                                </td>
                                                <td className="fw-semibold text-secondary">{(page - 1) * 10 + index + 1}</td>
                                                <td className="fw-bold text-dark">{customer.name}</td>
                                                <td>
                                                    <span className="text-body text-break d-inline-block" style={{ maxWidth: "200px" }}>
                                                        {customer.email}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-secondary text-truncate d-inline-block" style={{ maxWidth: "180px" }} title={customer.company}>
                                                        {customer.company || "-"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Badge bg={
                                                        (customer.state || "").toLowerCase().includes("interested") ? "primary" :
                                                        (customer.state || "").toLowerCase().includes("closed") ? "success" : "secondary"
                                                    } className="px-3 py-2 font-monospace fw-medium">
                                                        {customer.state || "Active"}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <span className="text-muted">{customer.prediction || "-"}</span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-inline-flex align-items-center justify-content-center gap-1">
                                                        <Link
                                                            to={`/customers/${customer.id}`}
                                                            className="btn btn-info btn-sm text-white px-2 py-1 d-inline-flex align-items-center gap-1"
                                                            title="View Customer Details"
                                                        >
                                                            <FiEye size={14} />
                                                            <span>View</span>
                                                        </Link>
                                                        <Link
                                                            to={`/customers/edit/${customer.id}`}
                                                            className="btn btn-warning btn-sm text-dark px-2 py-1 d-inline-flex align-items-center gap-1"
                                                            title="Edit Customer"
                                                        >
                                                            <FiEdit2 size={14} />
                                                            <span>Edit</span>
                                                        </Link>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="px-2 py-1 d-inline-flex align-items-center gap-1"
                                                            onClick={() => handleDelete(customer.id)}
                                                            title="Delete Customer"
                                                        >
                                                            <FiTrash2 size={14} />
                                                            <span>Delete</span>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            {activeFilter || activeQuery 
                                                ? "No Customers Found Matching Filter Criteria" 
                                                : "No Customers Found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Pagination Controls */}
            {activeQuery === "" && totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <Button
                        variant="outline-secondary"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-muted fw-semibold">
                        Page <span className="text-dark fw-bold">{page}</span> of {totalPages}
                    </span>
                    <Button
                        variant="outline-secondary"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </MainLayout>
    );
}
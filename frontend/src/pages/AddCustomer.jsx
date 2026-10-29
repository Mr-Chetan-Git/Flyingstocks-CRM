import { useState, useRef } from "react";
import { Form, Button, Card, Row, Col, Alert, Table, Badge, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { addCustomer } from "../api/customerApi";
import MainLayout from "../layouts/MainLayout";
import { parseExcelFile } from "../utils/excelParser";
import { FiUpload, FiCheckCircle, FiXCircle, FiSave, FiArrowLeft, FiAlertCircle } from "react-icons/fi";

export default function AddCustomer() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Form State for Manual Single Customer Addition
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        company: "",
        designation: "",
        comments: "",
        state: "",
        prediction: "",
        recommended_action: ""
    });

    // Excel Import States
    const [parsing, setParsing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
    const [excelRecords, setExcelRecords] = useState(null); // Array of parsed records
    const [errorMessage, setErrorMessage] = useState("");
    const [summaryMessage, setSummaryMessage] = useState(null);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    // Manual Form Submit
    async function handleSubmit(e) {
        e.preventDefault();
        setErrorMessage("");

        if (!formData.name || formData.name.trim() === "") {
            setErrorMessage("Customer Name is required.");
            return;
        }

        try {
            await addCustomer(formData);
            alert("Customer Added Successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.log("Status:", err.response?.status);
            console.log("Response:", err.response?.data);
            setErrorMessage(err.response?.data?.message || err.response?.data?.msg || "Failed to add customer. Please check input values.");
        }
    }

    // Handle "Load Excel" File Selection
    async function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setParsing(true);
        setErrorMessage("");
        setSummaryMessage(null);
        setExcelRecords(null);

        try {
            const parsed = await parseExcelFile(file);
            setExcelRecords(parsed);
        } catch (err) {
            setErrorMessage(err.message || "Failed to read Excel file.");
        } finally {
            setParsing(false);
            // Reset input so re-selecting same file triggers event
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    // Trigger Native File Picker
    function handleLoadExcelClick() {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    // Save Parsed Excel Records to Database
    async function handleImportExcelRecords() {
        if (!excelRecords || excelRecords.length === 0) return;

        const validRecords = excelRecords.filter(r => r.isValid);
        if (validRecords.length === 0) {
            setErrorMessage("No valid records to import. Please fix errors in Excel file.");
            return;
        }

        setImporting(true);
        setErrorMessage("");
        setSummaryMessage(null);
        setImportProgress({ current: 0, total: validRecords.length });

        let successCount = 0;
        let skippedCount = 0;
        let failCount = 0;

        for (let i = 0; i < validRecords.length; i++) {
            const item = validRecords[i];
            setImportProgress({ current: i + 1, total: validRecords.length });

            try {
                const res = await addCustomer(item.data);
                if (res.data?.skipped || res.skipped) {
                    skippedCount++;
                } else {
                    successCount++;
                }
            } catch (err) {
                console.error(`Failed to import row ${item.rowNumber}:`, err);
                failCount++;
            }
        }

        setImporting(false);

        const totalProcessed = excelRecords.length;
        const totalInvalidSkipped = excelRecords.length - validRecords.length;

        setSummaryMessage({
            total: totalProcessed,
            newAdded: successCount,
            skippedDuplicates: skippedCount,
            failed: failCount + totalInvalidSkipped,
            invalidSkipped: totalInvalidSkipped
        });

        if (successCount > 0 || skippedCount > 0) {
            setTimeout(() => {
                navigate("/dashboard");
            }, 3000);
        }
    }

    // Clear Excel Preview
    function handleClearExcel() {
        setExcelRecords(null);
        setErrorMessage("");
        setSummaryMessage(null);
    }

    // Derived statistics for Excel Preview
    const validCount = excelRecords ? excelRecords.filter(r => r.isValid).length : 0;
    const invalidCount = excelRecords ? excelRecords.filter(r => !r.isValid).length : 0;

    return (
        <MainLayout title="Add Customer">
            {/* Hidden Native File Input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".xlsx, .xls"
                onChange={handleFileSelect}
            />

            {/* Header Action Bar */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-2">
                    <Link to="/dashboard" className="btn btn-outline-secondary btn-sm me-2">
                        <FiArrowLeft className="me-1" /> Back to Dashboard
                    </Link>
                    <h3 className="m-0 fw-bold">Add Customer</h3>
                </div>

                {/* "Load Excel" Action Button */}
                <Button
                    variant="outline-primary"
                    className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
                    onClick={handleLoadExcelClick}
                    disabled={parsing || importing}
                    style={{ borderRadius: "8px" }}
                >
                    {parsing ? (
                        <>
                            <Spinner animation="border" size="sm" />
                            <span>Reading Excel...</span>
                        </>
                    ) : (
                        <>
                            <FiUpload size={18} />
                            <span>Load Excel</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
                <Alert variant="danger" dismissible onClose={() => setErrorMessage("")} className="mb-4">
                    <FiAlertCircle className="me-2 fs-5" />
                    {errorMessage}
                </Alert>
            )}

            {/* Import Summary Feedback Alert */}
            {summaryMessage && (
                <Alert 
                    variant={(summaryMessage.newAdded > 0 || summaryMessage.skippedDuplicates > 0) ? "success" : "warning"} 
                    className="mb-4 shadow-sm"
                    style={{ borderRadius: "10px" }}
                >
                    <div className="d-flex align-items-center gap-2 mb-2 fw-bold fs-5">
                        <FiCheckCircle />
                        <span>Excel Import Execution Complete!</span>
                    </div>
                    <ul className="mb-0 ps-3">
                        <li><strong>Total Rows Processed:</strong> {summaryMessage.total}</li>
                        <li className="text-success"><strong>New Customers Added:</strong> {summaryMessage.newAdded}</li>
                        {summaryMessage.skippedDuplicates > 0 && (
                            <li className="text-primary"><strong>Duplicates Skipped (Already in Database):</strong> {summaryMessage.skippedDuplicates}</li>
                        )}
                        {summaryMessage.failed > 0 && (
                            <li className="text-danger"><strong>Failed / Invalid Rows:</strong> {summaryMessage.failed} ({summaryMessage.invalidSkipped} invalid format)</li>
                        )}
                    </ul>
                    {(summaryMessage.newAdded > 0 || summaryMessage.skippedDuplicates > 0) && (
                        <p className="mt-2 mb-0 text-muted fst-italic">
                            Redirecting to Customer Directory...
                        </p>
                    )}
                </Alert>
            )}

            {/* PREVIEW SECTION IF EXCEL IS LOADED */}
            {excelRecords ? (
                <Card className="shadow-sm mb-4" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <Card.Header className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                        <div>
                            <h5 className="m-0 fw-bold">Excel Import Preview</h5>
                            <small className="text-muted">Review extracted data before saving to database</small>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex gap-2">
                                <Badge bg="primary" className="px-3 py-2 fs-6" style={{ borderRadius: "20px" }}>
                                    Total: {excelRecords.length}
                                </Badge>
                                <Badge bg="success" className="px-3 py-2 fs-6" style={{ borderRadius: "20px" }}>
                                    Valid: {validCount}
                                </Badge>
                                {invalidCount > 0 && (
                                    <Badge bg="danger" className="px-3 py-2 fs-6" style={{ borderRadius: "20px" }}>
                                        Invalid: {invalidCount}
                                    </Badge>
                                )}
                            </div>

                            <Button 
                                variant="success" 
                                className="d-flex align-items-center gap-2 fw-semibold"
                                onClick={handleImportExcelRecords}
                                disabled={importing || validCount === 0}
                                style={{ borderRadius: "8px" }}
                            >
                                {importing ? (
                                    <>
                                        <Spinner animation="border" size="sm" />
                                        <span>Importing {importProgress.current} of {importProgress.total}...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSave />
                                        <span>Save {validCount} Valid Records</span>
                                    </>
                                )}
                            </Button>

                            <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                onClick={handleClearExcel}
                                disabled={importing}
                            >
                                Clear
                            </Button>
                        </div>
                    </Card.Header>

                    <Card.Body className="p-0">
                        <div className="table-responsive" style={{ maxHeight: "420px" }}>
                            <Table hover className="align-middle mb-0 text-nowrap">
                                <thead className="bg-light sticky-top">
                                    <tr>
                                        <th style={{ width: "60px" }}>#</th>
                                        <th>Status</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Company</th>
                                        <th>Designation</th>
                                        <th>State</th>
                                        <th>Validation Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelRecords.map((row) => (
                                        <tr 
                                            key={row.rowNumber}
                                            className={!row.isValid ? "table-danger" : ""}
                                        >
                                            <td className="text-muted">{row.rowNumber}</td>
                                            <td>
                                                {row.isValid ? (
                                                    <Badge bg="success" className="d-inline-flex align-items-center gap-1">
                                                        <FiCheckCircle /> Valid
                                                    </Badge>
                                                ) : (
                                                    <Badge bg="danger" className="d-inline-flex align-items-center gap-1">
                                                        <FiXCircle /> Invalid
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="fw-semibold">{row.data.name || "-"}</td>
                                            <td>{row.data.email || "-"}</td>
                                            <td>{row.data.mobile || "-"}</td>
                                            <td>{row.data.company || "-"}</td>
                                            <td>{row.data.designation || "-"}</td>
                                            <td>{row.data.state || "-"}</td>
                                            <td>
                                                {row.isValid ? (
                                                    <span className="text-success small">Ready for insertion</span>
                                                ) : (
                                                    <span className="text-danger small fw-semibold">
                                                        {row.errors.join(", ")}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            ) : null}

            {/* MANUAL SINGLE CUSTOMER FORM */}
            <Card className="shadow-sm" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <Card.Body className="p-4">
                    <h5 className="mb-4 fw-bold text-secondary">
                        {excelRecords ? "Or Fill Form Manually" : "Manual Customer Information"}
                    </h5>

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Name *</Form.Label>
                                    <Form.Control
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full Customer Name"
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@example.com"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Mobile</Form.Label>
                                    <Form.Control
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="+1 555-0192"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Company</Form.Label>
                                    <Form.Control
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        placeholder="Company / Organization Name"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Designation</Form.Label>
                                    <Form.Control
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="Job Title / Role"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">State / Status</Form.Label>
                                    <Form.Select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Status</option>
                                        <option>Interested</option>
                                        <option>Follow Up</option>
                                        <option>Closed</option>
                                        <option>Not Interested</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Comments</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="comments"
                                value={formData.comments}
                                onChange={handleChange}
                                placeholder="Additional notes or interaction details..."
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Prediction</Form.Label>
                                    <Form.Select
                                        name="prediction"
                                        value={formData.prediction}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Likelihood</option>
                                        <option>High Conversion</option>
                                        <option>Medium Conversion</option>
                                        <option>Low Conversion</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Recommended Action</Form.Label>
                                    <Form.Control
                                        name="recommended_action"
                                        value={formData.recommended_action}
                                        onChange={handleChange}
                                        placeholder="Next steps..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="mt-2 px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                            style={{ borderRadius: "8px" }}
                        >
                            <FiSave />
                            <span>Save Single Customer</span>
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </MainLayout>
    );
}
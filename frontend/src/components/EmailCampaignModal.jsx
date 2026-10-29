import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner, Badge, Card, Tab, Nav, Row, Col } from "react-bootstrap";
import { generateEmailTemplate, sendEmailCampaign } from "../api/emailApi";
import { FiCpu, FiSend, FiCheckCircle, FiAlertCircle, FiEdit3, FiEye, FiUsers, FiMail } from "react-icons/fi";

export default function EmailCampaignModal({
  show,
  onHide,
  selectedCustomers = [],
  activeFilter = "",
  totalFilterCount = 0
}) {
  // Selection Scope Option
  const [recipientMode, setRecipientMode] = useState("selected"); // "selected" or "filter"

  // AI Toggle & Campaign Topic State
  const [enableAI, setEnableAI] = useState(true);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);

  // Template State (Master Copy)
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [campaignName, setCampaignName] = useState("Product Update Campaign");

  // Delivery Settings
  const [dryRun, setDryRun] = useState(false);
  const [sending, setSending] = useState(false);

  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState("editor");

  // Sync recipient mode when modal opens
  useEffect(() => {
    if (show) {
      if (selectedCustomers.length > 0) {
        setRecipientMode("selected");
      } else if (activeFilter) {
        setRecipientMode("filter");
      } else {
        setRecipientMode("selected");
      }
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [show, selectedCustomers, activeFilter]);

  // Handle AI Email Generation
  async function handleGenerateAI() {
    if (!topic || !topic.trim()) {
      setErrorMsg("Please enter a campaign topic first.");
      return;
    }

    setGenerating(true);
    setErrorMsg("");

    try {
      const response = await generateEmailTemplate(topic.trim());
      if (response && response.data) {
        setSubject(response.data.subject || "");
        setBody(response.data.body || "");
        setCampaignName(`AI Campaign: ${topic.trim().substring(0, 30)}`);
        setActiveTab("editor");
      }
    } catch (err) {
        console.error("AI Generation Error:", err);
        setErrorMsg(err.response?.data?.message || "Failed to generate AI email template. Using fallback template.");
        setSubject(`Update: ${topic.trim()} for {name}`);
        setBody(`Dear {name},\n\nWe would like to share an update regarding ${topic.trim()} with your team at {company}.\n\nBest regards,\nCRM Sales Team`);
    } finally {
      setGenerating(false);
    }
  }

  // Insert Variable Token into Body/Subject
  function insertPlaceholder(token) {
    setBody((prev) => prev + ` ${token}`);
  }

  // Render Live Personalization Preview for sample recipient
  const renderPersonalizedPreview = (sampleCustomer) => {
    if (!sampleCustomer) return { subject: "", body: "" };

    const name = sampleCustomer.name || "Valued Client";
    const company = sampleCustomer.company || "Organization";
    const state = sampleCustomer.state || "Active";

    const pSubject = (subject || "")
      .replace(/\{name\}/g, name)
      .replace(/\{company\}/g, company)
      .replace(/\{state\}/g, state);

    const pBody = (body || "")
      .replace(/\{name\}/g, name)
      .replace(/\{company\}/g, company)
      .replace(/\{state\}/g, state);

    return { subject: pSubject, body: pBody };
  };

  // Submit Campaign
  async function handleSendCampaign() {
    if (!subject || !subject.trim()) {
      setErrorMsg("Email Subject is required.");
      return;
    }

    if (!body || !body.trim()) {
      setErrorMsg("Email Body content is required.");
      return;
    }

    if (recipientMode === "selected" && selectedCustomers.length === 0) {
      setErrorMsg("Please select at least one customer from the table or switch to filter selection.");
      return;
    }

    setSending(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      campaign_name: campaignName,
      subject: subject.trim(),
      body: body.trim(),
      dry_run: dryRun
    };

    if (recipientMode === "selected") {
      payload.customer_ids = selectedCustomers.map((c) => c.id);
    } else {
      payload.filter = activeFilter;
    }

    try {
      const response = await sendEmailCampaign(payload);
      setSuccessMsg(response.message || "Campaign queued successfully for background sending!");
      setTimeout(() => {
        onHide();
      }, 2500);
    } catch (err) {
      console.error("Send Campaign Error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to send email campaign.");
    } finally {
      setSending(false);
    }
  };

  const recipientCount = recipientMode === "selected" 
    ? selectedCustomers.length 
    : (totalFilterCount || "All Filtered");

  const sampleCustomer = selectedCustomers.length > 0 
    ? selectedCustomers[0] 
    : { name: "John Doe", company: "Acme Corp", state: "Interested" };

  const previewSample = renderPersonalizedPreview(sampleCustomer);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <FiMail className="text-primary" />
          <span>AI-Powered Email Campaign</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Error Alert */}
        {errorMsg && (
          <Alert variant="danger" dismissible onClose={() => setErrorMsg("")} className="mb-3">
            <FiAlertCircle className="me-2" />
            {errorMsg}
          </Alert>
        )}

        {/* Success Alert */}
        {successMsg && (
          <Alert variant="success" className="mb-3">
            <FiCheckCircle className="me-2" />
            {successMsg}
          </Alert>
        )}

        {/* STEP 1: RECIPIENT SELECTION SCOPE */}
        <Card className="mb-4 bg-light border-0">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="fw-semibold text-secondary d-block">Target Recipients:</span>
                <span className="fw-bold fs-5 text-dark">
                  {recipientMode === "selected" 
                    ? `${selectedCustomers.length} Customer(s) Selected` 
                    : `All Matching Filter: ${activeFilter.toUpperCase() || "Directory"}`}
                </span>
              </div>

              <div className="d-flex gap-2">
                <Form.Check
                  type="radio"
                  id="scope-selected"
                  name="recipientScope"
                  label={`Individual Selection (${selectedCustomers.length})`}
                  checked={recipientMode === "selected"}
                  onChange={() => setRecipientMode("selected")}
                  disabled={selectedCustomers.length === 0}
                />
                {activeFilter && (
                  <Form.Check
                    type="radio"
                    id="scope-filter"
                    name="recipientScope"
                    label={`Current Filter (${activeFilter})`}
                    checked={recipientMode === "filter"}
                    onChange={() => setRecipientMode("filter")}
                  />
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* STEP 2: AI TOGGLE & CAMPAIGN TOPIC */}
        <Card className="mb-4 border-0 shadow-sm" style={{ backgroundColor: "#f0f7ff", borderRadius: "10px" }}>
          <Card.Body className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <FiCpu className="text-primary fs-4" />
                <span className="fw-bold text-primary fs-6">AI Email Generation Workflow</span>
              </div>
              <Form.Check
                type="switch"
                id="enable-ai-switch"
                label={enableAI ? "AI Mode Enabled" : "Manual Mode"}
                checked={enableAI}
                onChange={(e) => setEnableAI(e.target.checked)}
                className="fw-bold text-secondary"
              />
            </div>

            {enableAI && (
              <Row className="g-2">
                <Col md={9}>
                  <Form.Control
                    type="text"
                    placeholder="Enter Campaign Topic (e.g. Follow-up invite for Google Maps Architecture Workshop)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Button
                    variant="primary"
                    className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    onClick={handleGenerateAI}
                    disabled={generating || !topic.trim()}
                  >
                    {generating ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FiCpu />
                        <span>Draft Copy</span>
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* STEP 3 & 4: TEMPLATE EDITOR & LIVE PERSONALIZATION PREVIEW */}
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="editor" className="d-flex align-items-center gap-2 fw-semibold">
                <FiEdit3 /> Master Template Editor
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="preview" className="d-flex align-items-center gap-2 fw-semibold">
                <FiEye /> Live Personalization Preview
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* EDITOR TAB */}
            <Tab.Pane eventKey="editor">
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email Subject</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Subject (use {name}, {company}, {state})"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <Form.Label className="fw-semibold m-0">Email Body Template</Form.Label>
                  <div className="d-flex gap-1 align-items-center">
                    <span className="small text-muted me-1">Insert Personalization Token:</span>
                    <Badge 
                      bg="secondary" 
                      style={{ cursor: "pointer" }}
                      onClick={() => insertPlaceholder("{name}")}
                    >
                      + {"{name}"}
                    </Badge>
                    <Badge 
                      bg="secondary" 
                      style={{ cursor: "pointer" }}
                      onClick={() => insertPlaceholder("{company}")}
                    >
                      + {"{company}"}
                    </Badge>
                    <Badge 
                      bg="secondary" 
                      style={{ cursor: "pointer" }}
                      onClick={() => insertPlaceholder("{state}")}
                    >
                      + {"{state}"}
                    </Badge>
                  </div>
                </div>
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder="Enter Email Body Content..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </Form.Group>
            </Tab.Pane>

            {/* PREVIEW TAB */}
            <Tab.Pane eventKey="preview">
              <Card className="border">
                <Card.Header className="bg-light d-flex align-items-center justify-content-between py-2">
                  <span className="small fw-bold text-muted">
                    Rendered Sample Preview for: <span className="text-dark">{sampleCustomer.name} ({sampleCustomer.email || "sample@domain.com"})</span>
                  </span>
                  <Badge bg="info">Sample #{sampleCustomer.id || 1}</Badge>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong className="text-muted d-block small">SUBJECT:</strong>
                    <div className="fw-bold text-dark fs-6">{previewSample.subject || "(Empty Subject)"}</div>
                  </div>
                  <hr />
                  <div>
                    <strong className="text-muted d-block small mb-2">BODY:</strong>
                    <div style={{ whiteSpace: "pre-wrap" }} className="text-secondary">
                      {previewSample.body || "(Empty Body)"}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer className="border-top d-flex align-items-center justify-content-between">
        <Form.Check
          type="checkbox"
          id="dry-run-check"
          label="Dry-Run Simulation (Test without sending real SMTP emails)"
          checked={dryRun}
          onChange={(e) => setDryRun(e.target.checked)}
          className="text-muted small"
        />

        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={onHide} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="fw-bold d-flex align-items-center gap-2 px-4"
            onClick={handleSendCampaign}
            disabled={sending || (!subject && !body)}
          >
            {sending ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>Queuing Campaign...</span>
              </>
            ) : (
              <>
                <FiSend />
                <span>Send to {recipientCount} Recipients</span>
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

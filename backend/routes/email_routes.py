from flask import Blueprint, request, current_app
from flask_jwt_extended import jwt_required
from services.ai_email_service import AIEmailService
from services.email_service import EmailService
from models.customer import Customer
from utils.response import success_response, error_response

email_bp = Blueprint("email", __name__)

# =====================================================
# GENERATE AI EMAIL TEMPLATE
# =====================================================
@email_bp.route("/email/generate-template", methods=["POST"])
@jwt_required()
def generate_template():
    data = request.get_json() or {}
    topic = data.get("topic")

    if not topic or not str(topic).strip():
        return error_response("Campaign topic is required", 400)

    template, error = AIEmailService.generate_template(topic)
    if error:
        return error_response(error, 500)

    return success_response(
        "AI Email Template generated successfully",
        template
    )

# =====================================================
# SEND CAMPAIGN EMAILS
# =====================================================
@email_bp.route("/email/send-campaign", methods=["POST"])
@jwt_required()
def send_campaign():
    data = request.get_json() or {}
    customer_ids = data.get("customer_ids", [])
    filter_type = data.get("filter", "")
    subject = data.get("subject")
    body = data.get("body")
    campaign_name = data.get("campaign_name", "AI Email Campaign")
    dry_run = data.get("dry_run", False)

    if not subject or not str(subject).strip():
        return error_response("Email Subject is required", 400)

    if not body or not str(body).strip():
        return error_response("Email Body is required", 400)

    # If customer_ids not explicitly passed, query matching IDs based on filter_type
    if not customer_ids and filter_type:
        query = Customer.query
        f = filter_type.lower()
        if f == "interested":
            query = query.filter(Customer.state.ilike("%Interested%"))
        elif f == "registered":
            query = query.filter(Customer.state.in_(["Closed", "Registered"]))
        elif f in ["follow_up", "followup"]:
            query = query.filter(Customer.state.ilike("%Next Batch%"))

        matched_customers = query.all()
        customer_ids = [c.id for c in matched_customers]

    if not customer_ids:
        return error_response("No recipients selected for this campaign", 400)

    # Launch background sending batch thread
    app = current_app._get_current_object()
    EmailService.send_campaign_batch(
        app=app,
        customer_ids=customer_ids,
        subject_template=subject,
        body_template=body,
        campaign_name=campaign_name,
        dry_run=dry_run
    )

    return success_response(
        f"Campaign queued successfully for {len(customer_ids)} recipients.",
        {
            "recipient_count": len(customer_ids),
            "customer_ids": customer_ids,
            "campaign_name": campaign_name
        },
        202
    )

# =====================================================
# TEST SMTP CONNECTION
# =====================================================
@email_bp.route("/email/test-connection", methods=["POST"])
@jwt_required()
def test_smtp_connection():
    data = request.get_json() or {}
    test_email = data.get("test_email")

    success, message = EmailService.test_connection(test_email)
    if not success:
        return error_response(message, 500)

    return success_response(message, {"status": "CONNECTED", "test_email": test_email})


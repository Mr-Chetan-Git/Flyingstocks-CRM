from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from models.customer import Customer
from services.customer_service import CustomerService
from utils.response import success_response, error_response
from validators.customer_validator import validate_customer
from services.transformer_service import TransformerService

customer_bp = Blueprint("customer", __name__)


# =====================================================
# GET ALL CUSTOMERS (PAGINATION)
# =====================================================
@customer_bp.route("/customers", methods=["GET"])
@jwt_required()
def get_customers():

    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)

    customers = CustomerService.get_all_customers(page, limit)

    result = []

    for customer in customers.items:

        result.append({
            "id": customer.id,
            "date": str(customer.date),
            "name": customer.name,
            "email": customer.email,
            "mobile": customer.mobile,
            "designation": customer.designation,
            "state": customer.state,
            "company": customer.company,
            "summary": customer.summary,
            "prediction": customer.prediction
        })

    return success_response(
        "Customers fetched successfully",
        {
            "page": customers.page,
            "limit": customers.per_page,
            "total_records": customers.total,
            "total_pages": customers.pages,
            "customers": result
        }
    )


# =====================================================
# SEARCH CUSTOMER
# =====================================================
@customer_bp.route("/customers/search", methods=["GET"])
@jwt_required()
def search_customers():

    search = request.args.get("q")

    if not search:
        return error_response(
            "Search parameter 'q' is required",
            400
        )

    customers = CustomerService.search_customers(search)

    result = []

    for customer in customers:
        result.append({
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "mobile": customer.mobile,
            "company": customer.company,
            "prediction": customer.prediction
        })

    return success_response(
        "Customers found",
        result
    )

# =====================================================
# GET CUSTOMER BY ID
# =====================================================
@customer_bp.route("/customers/<int:id>", methods=["GET"])
@jwt_required()
def get_customer(id):

    customer = CustomerService.get_customer_by_id(id)

    if not customer:
        return error_response("Customer not found", 404)

    return success_response(
        "Customer fetched successfully",
        {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "mobile": customer.mobile,
            "designation": customer.designation,
            "state": customer.state,
            "company": customer.company,
            "comments": customer.comments,
            "summary": customer.summary,
            "prediction": customer.prediction,
            "recommended_action": customer.recommended_action
        }
    )


# =====================================================
# CREATE CUSTOMER
# =====================================================
@customer_bp.route("/customers", methods=["POST"])
@jwt_required()
def create_customer():

    from flask_jwt_extended import get_jwt_identity

    print("JWT Identity:", get_jwt_identity())

    data = request.get_json()

    print("Received Data:", data)

    errors = validate_customer(data)

    if errors:
        return error_response(errors, 400)
    customer = Customer(

        name=data.get("name"),
        email=data.get("email"),
        mobile=data.get("mobile"),
        designation=data.get("designation"),
        state=data.get("state"),
        company=data.get("company"),

        comments=data.get("comments"),
        summary=data.get("summary"),
        prediction=data.get("prediction"),

        recommended_action=data.get("recommended_action"),
        confirm_register=data.get("confirm_register"),
        youtube_video=data.get("youtube_video"),
        gap_analysis=data.get("gap_analysis"),
        update_status_notes=data.get("update_status_notes")

    )

    created_customer, is_new = CustomerService.create_customer(customer)

    if not is_new:
        return success_response(
            "Customer already exists (skipped duplicate)",
            {
                "id": created_customer.id,
                "skipped": True
            },
            200
        )

    return success_response(
        "Customer created successfully",
        {
            "id": created_customer.id,
            "skipped": False
        },
        201
    )


# =====================================================
# UPDATE CUSTOMER
# =====================================================
@customer_bp.route("/customers/<int:id>", methods=["PUT"])
@jwt_required()
def update_customer(id):

    customer = CustomerService.get_customer_by_id(id)

    if not customer:
        return error_response(
            "Customer not found",
            404
        )

    data = request.get_json()

    customer.name = data.get("name", customer.name)
    customer.email = data.get("email", customer.email)
    customer.mobile = data.get("mobile", customer.mobile)
    customer.designation = data.get("designation", customer.designation)
    customer.state = data.get("state", customer.state)
    customer.company = data.get("company", customer.company)
    customer.comments = data.get("comments", customer.comments)
    customer.summary = data.get("summary", customer.summary)
    customer.prediction = data.get("prediction", customer.prediction)
    customer.recommended_action = data.get(
        "recommended_action",
        customer.recommended_action
    )
    customer.confirm_register = data.get(
        "confirm_register",
        customer.confirm_register
    )
    customer.youtube_video = data.get(
        "youtube_video",
        customer.youtube_video
    )
    customer.gap_analysis = data.get(
        "gap_analysis",
        customer.gap_analysis
    )
    customer.update_status_notes = data.get(
        "update_status_notes",
        customer.update_status_notes
    )

    CustomerService.update_customer(customer)

    return success_response(
        "Customer updated successfully"
    )


# =====================================================
# DELETE CUSTOMER
# =====================================================
@customer_bp.route("/customers/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_customer(id):

    customer = CustomerService.get_customer_by_id(id)

    if not customer:
        return error_response(
            "Customer not found",
            404
        )

    CustomerService.delete_customer(customer)

    return success_response(
        "Customer deleted successfully"
    )


# =====================================================
# GENERATE TRANSFORMER AI SUMMARY FOR CUSTOMER
# =====================================================
@customer_bp.route("/customers/<int:id>/generate-summary", methods=["POST"])
@jwt_required()
def generate_customer_summary(id):

    customer = CustomerService.get_customer_by_id(id)

    if not customer:
        return error_response("Customer not found", 404)

    if not customer.comments or not str(customer.comments).strip():
        return error_response("No customer comments available to summarize", 400)

    summary = TransformerService.summarize_comment(customer.comments)

    customer.summary = summary
    CustomerService.update_customer(customer)

    return success_response(
        "AI summary generated successfully",
        {
            "id": customer.id,
            "summary": summary
        }
    )


# =====================================================
# GENERATE TRANSFORMER AI PREDICTION FOR CUSTOMER
# =====================================================
@customer_bp.route("/customers/<int:id>/generate-prediction", methods=["POST"])
@jwt_required()
def generate_customer_prediction(id):

    customer = CustomerService.get_customer_by_id(id)

    if not customer:
        return error_response("Customer not found", 404)

    if not customer.comments or not str(customer.comments).strip():
        return error_response("No customer comments available for prediction", 400)

    res = TransformerService.predict_lead(customer.comments)

    customer.prediction = res.get("prediction")
    customer.recommended_action = res.get("recommended_action")
    CustomerService.update_customer(customer)

    return success_response(
        "AI prediction generated successfully",
        {
            "id": customer.id,
            "prediction": customer.prediction,
            "recommended_action": customer.recommended_action
        }
    )
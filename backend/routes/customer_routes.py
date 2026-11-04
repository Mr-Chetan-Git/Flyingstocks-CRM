from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import text

from database.connection import db
from models.customer import Customer
from services.customer_service import CustomerService
from services.transformer_service import TransformerService
from utils.response import success_response, error_response
from validators.customer_validator import validate_customer


customer_bp = Blueprint("customer", __name__)


# =====================================================
# GET ALL CUSTOMERS
# DATE + NAME + STATE FILTER + PAGINATION
# =====================================================
@customer_bp.route("/customers", methods=["GET"])
@jwt_required()
def get_customers():
    try:
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=10, type=int)

        start_date = request.args.get("start_date", "").strip()
        end_date = request.args.get("end_date", "").strip()
        name = request.args.get("name", "").strip()
        state = request.args.get("state", "").strip()

        if page < 1 or limit < 1:
            return error_response("Invalid page or limit", 400)

        query = Customer.query

        # TEMPORARY DEBUG: CHECK DATABASE COUNT
        db_info = db.session.execute(
            text("""
                SELECT
                    current_database() AS database_name,
                    current_schema() AS schema_name,
                    COUNT(*) AS customer_count
                FROM crm_customer_info
            """)
        ).mappings().first()

        print("FLASK DATABASE INFO:", dict(db_info))
        print("REQUEST FILTERS:", request.args.to_dict())
        print("MODEL COUNT BEFORE FILTERS:", query.count())

        # DATE FILTER
        if start_date:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Customer.date >= start)

        if end_date:
            end = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(
                Customer.date < end + timedelta(days=1)
            )

        # NAME FILTER
        if name:
            query = query.filter(
                Customer.name.ilike(f"%{name}%")
            )

        # STATE FILTER
        if state and state.lower() != "all":
            if state.lower() == "open":
                # Dashboard displays Open when state is blank or NULL
                query = query.filter(
                    (Customer.state.is_(None)) |
                    (Customer.state == "")
                )
            else:
                query = query.filter(
                    Customer.state.ilike(state)
                )

        # COUNT AFTER FILTERS
        total_records = query.count()

        # PAGINATION
        customers = (
            query
            .order_by(Customer.date.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        result = []

        for customer in customers:
            result.append({
                "id": customer.id,
                "date": (
                    customer.date.isoformat()
                    if customer.date
                    else None
                ),
                "name": customer.name,
                "email": customer.email,
                "mobile": customer.mobile,
                "designation": customer.designation,
                "state": customer.state,
                "company": customer.company,
                "summary": customer.summary,
                "prediction": customer.prediction
            })

        total_pages = (
            (total_records + limit - 1) // limit
            if total_records > 0
            else 0
        )

        return success_response(
            "Customers fetched successfully",
            {
                "page": page,
                "limit": limit,
                "total_records": total_records,
                "total_pages": total_pages,
                "customers": result
            }
        )

    except ValueError:
        return error_response(
            "Invalid date format. Use YYYY-MM-DD",
            400
        )

    except Exception as e:
        print("Get customers error:", str(e))
        return error_response(
            "Unable to fetch customers",
            500
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
        return error_response(
            "Customer not found",
            404
        )

    return success_response(
        "Customer fetched successfully",
        {
            "id": customer.id,
            "date": (
                customer.date.isoformat()
                if customer.date
                else None
            ),
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
    print("JWT Identity:", get_jwt_identity())

    data = request.get_json()

    if not data:
        return error_response(
            "Request body is required",
            400
        )

    print("Received Data:", data)

    errors = validate_customer(data)

    if errors:
        return error_response(errors, 400)

    customer_date = data.get("date")

    if customer_date:
        try:
            customer_date = datetime.fromisoformat(
                customer_date.replace("Z", "+00:00")
            )

            if customer_date.tzinfo is not None:
                customer_date = customer_date.replace(tzinfo=None)

        except (ValueError, AttributeError):
            return error_response(
                "Invalid date format. Use YYYY-MM-DD or ISO datetime",
                400
            )
    else:
        customer_date = datetime.now()

    customer = Customer(
        date=customer_date,
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
            "skipped": False,
            "date": (
                created_customer.date.isoformat()
                if created_customer.date
                else None
            )
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

    if not data:
        return error_response(
            "Request body is required",
            400
        )

    customer.name = data.get("name", customer.name)
    customer.email = data.get("email", customer.email)
    customer.mobile = data.get("mobile", customer.mobile)
    customer.designation = data.get(
        "designation",
        customer.designation
    )
    customer.state = data.get("state", customer.state)
    customer.company = data.get("company", customer.company)
    customer.comments = data.get("comments", customer.comments)
    customer.summary = data.get("summary", customer.summary)

    customer.prediction = data.get(
        "prediction",
        customer.prediction
    )

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

    if "date" in data:
        date_value = data.get("date")

        if date_value:
            try:
                customer_date = datetime.fromisoformat(
                    date_value.replace("Z", "+00:00")
                )

                if customer_date.tzinfo is not None:
                    customer_date = customer_date.replace(tzinfo=None)

                customer.date = customer_date

            except (ValueError, AttributeError):
                return error_response(
                    "Invalid date format. Use YYYY-MM-DD or ISO datetime",
                    400
                )
        else:
            customer.date = None

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
@customer_bp.route(
    "/customers/<int:id>/generate-summary",
    methods=["POST"]
)
@jwt_required()
def generate_customer_summary(id):
    customer = CustomerService.get_customer_by_id(id)

    if not customer:
        return error_response(
            "Customer not found",
            404
        )

    if not customer.comments or not str(customer.comments).strip():
        return error_response(
            "No customer comments available to summarize",
            400
        )

    summary = TransformerService.summarize_comment(
        customer.comments
    )

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
@customer_bp.route(
    "/customers/<int:id>/generate-prediction",
    methods=["POST"]
)
@jwt_required()
def generate_customer_prediction(id):
    customer = CustomerService.get_customer_by_id(id)

    if not customer:
        return error_response(
            "Customer not found",
            404
        )

    if not customer.comments or not str(customer.comments).strip():
        return error_response(
            "No customer comments available for prediction",
            400
        )

    res = TransformerService.predict_lead(
        customer.comments
    )

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
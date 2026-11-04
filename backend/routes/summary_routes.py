
# from flask import Blueprint, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from sqlalchemy import inspect

# from database.connection import db
# from models.customer import Customer
# from models.summary import Summary
# from services.transformer_service import TransformerService


# summary_bp = Blueprint("summary", __name__)


# def build_customer_text(customer):
#     """Build useful input from the customer's existing CRM details."""

#     fields = {
#         "Name": customer.name,
#         "Email": customer.email,
#         "Mobile": customer.mobile,
#         "Company": customer.company,
#         "Designation": customer.designation,
#         "Location/State": customer.state,
#         "Comments": customer.comments,
#         "Update Notes": customer.update_status_notes,
#         "Registration Details": customer.confirm_register,
#         "Gap Analysis": customer.gap_analysis,
#     }

#     return "\n".join(
#         f"{label}: {str(value).strip()}"
#         for label, value in fields.items()
#         if value is not None and str(value).strip()
#     )


# def fallback_summary(customer):
#     """Generate a useful summary even if the Transformer is unavailable."""

#     parts = []

#     if customer.name:
#         parts.append(f"{customer.name} is a CRM customer")

#     if customer.company:
#         parts.append(f"associated with {customer.company}")

#     if customer.designation:
#         parts.append(f"working as {customer.designation}")

#     result = " ".join(parts) + "." if parts else "Customer details are available in the CRM."

#     if customer.comments:
#         result += f" Customer comments: {customer.comments.strip()}"

#     if customer.update_status_notes:
#         result += f" Recent update notes: {customer.update_status_notes.strip()}"

#     if customer.gap_analysis:
#         result += f" Gap analysis: {customer.gap_analysis.strip()}"

#     if not customer.comments and not customer.update_status_notes:
#         result += " No additional customer interaction notes are available."

#     result += " Further engagement is recommended to understand the customer's requirements."

#     return result


# def get_customer_for_user(customer_id):
#     """Fetch a customer and check ownership when the model has user_id."""

#     query = Customer.query.filter_by(id=customer_id)

#     # Apply ownership filtering if Customer has a user_id column.
#     if "user_id" in Customer.__table__.columns:
#         user_id = get_jwt_identity()
#         query = query.filter(Customer.user_id == user_id)

#     return query.first()


# @summary_bp.route(
#     "/customers/<int:customer_id>/summary",
#     methods=["POST"]
# )
# @jwt_required()
# def generate_customer_summary(customer_id):

#     try:
#         customer = get_customer_for_user(customer_id)

#         if customer is None:
#             return jsonify({
#                 "success": False,
#                 "message": "Customer not found or access denied."
#             }), 404

#         customer_text = build_customer_text(customer)

#         if not customer_text.strip():
#             return jsonify({
#                 "success": False,
#                 "message": "No customer information available to summarize."
#             }), 400

#         # Try the existing Transformer service.
#         generated_summary = TransformerService.summarize_comment(
#             customer_text
#         )

#         # Use fallback if the model is unavailable or generation fails.
#         if (
#             not generated_summary
#             or generated_summary.startswith(
#                 ("Summary unavailable", "Failed to generate", "Could not generate")
#             )
#         ):
#             generated_summary = fallback_summary(customer)

#         generated_summary = str(generated_summary).strip()

#         if not generated_summary:
#             generated_summary = fallback_summary(customer)

#         # Save latest summary in the existing customer table.
#         customer.summary = generated_summary

#         # Save a separate history record.
#         history = Summary(
#             customer_id=customer.id,
#             summary_text=generated_summary
#         )

#         db.session.add(history)
#         db.session.commit()

#         return jsonify({
#             "success": True,
#             "message": "Customer summary generated successfully.",
#             "customer_id": customer.id,
#             "summary": generated_summary
#         }), 200

#     except Exception as e:
#         db.session.rollback()
#         print(f"Customer summary generation error: {e}")

#         return jsonify({
#             "success": False,
#             "message": "Unable to generate customer summary.",
#             "error": str(e)
#         }), 500


# @summary_bp.route(
#     "/customers/<int:customer_id>/summary",
#     methods=["GET"]
# )
# @jwt_required()
# def get_customer_summary(customer_id):

#     try:
#         customer = get_customer_for_user(customer_id)

#         if customer is None:
#             return jsonify({
#                 "success": False,
#                 "message": "Customer not found or access denied."
#             }), 404

#         return jsonify({
#             "success": True,
#             "customer_id": customer.id,
#             "summary": customer.summary or "",
#             "history": [
#                 {
#                     "id": item.id,
#                     "summary": item.summary_text,
#                     "created_at": item.created_at.isoformat()
#                 }
#                 for item in Summary.query.filter_by(
#                     customer_id=customer.id
#                 ).order_by(Summary.created_at.desc()).all()
#             ]
#         }), 200

#     except Exception as e:
#         print(f"Get customer summary error: {e}")

#         return jsonify({
#             "success": False,
#             "message": "Unable to retrieve customer summary."
#         }), 500

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from database.connection import db
from models.customer import Customer
from models.summary import Summary
from services.transformer_service import TransformerService


summary_bp = Blueprint("summary", __name__)


# ==========================================
# GET CUSTOMER COMMENTS ONLY
# ==========================================

def build_customer_text(customer):
    """
    Use only customer comments for AI summarization.
    """
    return (customer.comments or "").strip()


# ==========================================
# FALLBACK SUMMARY
# ==========================================

def fallback_summary(customer):
    """
    If Transformer is unavailable, return the original comments.
    Never use other customer fields.
    """
    comments = build_customer_text(customer)

    if not comments:
        return "No comments available"

    return comments


# ==========================================
# GET CUSTOMER WITH OWNERSHIP CHECK
# ==========================================

def get_customer_for_user(customer_id):
    query = Customer.query.filter_by(id=customer_id)

    if "user_id" in Customer.__table__.columns:
        user_id = get_jwt_identity()
        query = query.filter(Customer.user_id == user_id)

    return query.first()


# ==========================================
# GENERATE CUSTOMER SUMMARY
# ==========================================

@summary_bp.route(
    "/customers/<int:customer_id>/summary",
    methods=["POST"]
)
@jwt_required()
def generate_customer_summary(customer_id):

    try:
        customer = get_customer_for_user(customer_id)

        if customer is None:
            return jsonify({
                "success": False,
                "message": "Customer not found or access denied."
            }), 404

        # Read comments only.
        customer_text = build_customer_text(customer)

        # If comments are empty, do not call AI.
        if not customer_text:

            customer.summary = "No comments available"
            db.session.commit()

            return jsonify({
                "success": True,
                "message": "No comments available to summarize.",
                "customer_id": customer.id,
                "summary": "No comments available"
            }), 200

        # Generate summary using Transformer.
        generated_summary = TransformerService.summarize_comment(
            customer_text
        )

        # Fallback if Transformer is unavailable.
        if (
            not generated_summary
            or generated_summary.startswith(
                (
                    "Summary unavailable",
                    "Failed to generate",
                    "Could not generate",
                    "No comments provided"
                )
            )
        ):
            generated_summary = fallback_summary(customer)

        generated_summary = str(generated_summary).strip()

        if not generated_summary:
            generated_summary = fallback_summary(customer)

        # Save latest summary in existing customer table.
        customer.summary = generated_summary

        # Save summary history.
        history = Summary(
            customer_id=customer.id,
            summary_text=generated_summary
        )

        db.session.add(history)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Customer comment summary generated successfully.",
            "customer_id": customer.id,
            "summary": generated_summary
        }), 200

    except Exception as e:

        db.session.rollback()

        print(f"Customer summary generation error: {e}")

        return jsonify({
            "success": False,
            "message": "Unable to generate customer summary.",
            "error": str(e)
        }), 500


# ==========================================
# GET SAVED CUSTOMER SUMMARY
# ==========================================

@summary_bp.route(
    "/customers/<int:customer_id>/summary",
    methods=["GET"]
)
@jwt_required()
def get_customer_summary(customer_id):

    try:
        customer = get_customer_for_user(customer_id)

        if customer is None:
            return jsonify({
                "success": False,
                "message": "Customer not found or access denied."
            }), 404

        return jsonify({
            "success": True,
            "customer_id": customer.id,
            "summary": customer.summary or "",
            "history": [
                {
                    "id": item.id,
                    "summary": item.summary_text,
                    "created_at": (
                        item.created_at.isoformat()
                        if item.created_at else None
                    )
                }
                for item in Summary.query.filter_by(
                    customer_id=customer.id
                ).order_by(
                    Summary.created_at.desc()
                ).all()
            ]
        }), 200

    except Exception as e:

        print(f"Get customer summary error: {e}")

        return jsonify({
            "success": False,
            "message": "Unable to retrieve customer summary."
        }), 500

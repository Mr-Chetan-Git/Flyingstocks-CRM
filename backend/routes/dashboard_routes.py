from flask import Blueprint
from flask_jwt_extended import jwt_required

from services.dashboard_service import DashboardService
from utils.response import success_response

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    data = DashboardService.get_dashboard_stats()

    return success_response(
        "Dashboard fetched successfully",
        data
    )
from sqlalchemy import or_
from models.customer import Customer
from database.connection import db


class CustomerService:

    # -------------------------
    # GET ALL CUSTOMERS
    # -------------------------
    @staticmethod
    def get_all_customers(page=1, limit=10):

        pagination = Customer.query.order_by(
            Customer.id.asc()
        ).paginate(
            page=page,
            per_page=limit,
            error_out=False
        )

        return pagination

    # -------------------------
    # GET CUSTOMER BY ID
    # -------------------------
    @staticmethod
    def get_customer_by_id(customer_id):

        return Customer.query.get(customer_id)

    # -------------------------
    # CREATE CUSTOMER
    # -------------------------
    @staticmethod
    def create_customer(customer):

        # Check for duplicate by email
        if customer.email and str(customer.email).strip():
            existing_email = Customer.query.filter(
                Customer.email.ilike(str(customer.email).strip())
            ).first()
            if existing_email:
                return existing_email, False

        # Check for duplicate by mobile
        if customer.mobile and str(customer.mobile).strip():
            existing_mobile = Customer.query.filter(
                Customer.mobile == str(customer.mobile).strip()
            ).first()
            if existing_mobile:
                return existing_mobile, False

        db.session.add(customer)
        db.session.commit()

        return customer, True

    # -------------------------
    # UPDATE CUSTOMER
    # -------------------------
    @staticmethod
    def update_customer(customer):

        db.session.commit()

        return customer
    # -------------------------
    # DELETE CUSTOMER
    # -------------------------
    @staticmethod
    def delete_customer(customer):

        db.session.delete(customer)
        db.session.commit()

    # -------------------------
    # SEARCH CUSTOMER
    # -------------------------
    @staticmethod
    def search_customers(search):

        return Customer.query.filter(
            or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%"),
                Customer.company.ilike(f"%{search}%"),
                Customer.mobile.ilike(f"%{search}%")
            )
        ).all()
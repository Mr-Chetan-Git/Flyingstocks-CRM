from database.connection import db
from datetime import datetime


class Customer(db.Model):
    __tablename__ = "crm_customer_info"

    id = db.Column(db.Integer, primary_key=True)
    
    date = db.Column(
        db.DateTime,
        nullable=True,
        default=datetime.now
    )

    name = db.Column(db.String(255))
    email = db.Column(db.String(255))
    mobile = db.Column(db.String(255))
    designation = db.Column(db.String(255))
    state = db.Column(db.String(255))

    update_status_notes = db.Column(db.Text)

    confirm_register = db.Column(db.String(255))

    youtube_video = db.Column(db.Text)

    comments = db.Column(db.Text)

    gap_analysis = db.Column(db.Text)

    company = db.Column(db.String(255))

    summary = db.Column(db.Text)

    prediction = db.Column(db.String(255))

    recommended_action = db.Column(db.Text)
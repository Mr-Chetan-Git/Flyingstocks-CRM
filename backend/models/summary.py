
from datetime import datetime
from database.connection import db


class Summary(db.Model):
    __tablename__ = "crm_customer_summaries"

    id = db.Column(db.Integer, primary_key=True)

    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("crm_customer_info.id"),
        nullable=False,
        index=True
    )

    summary_text = db.Column(db.Text, nullable=False)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

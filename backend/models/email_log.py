from database.connection import db
from datetime import datetime

class EmailCampaignLog(db.Model):
    __tablename__ = "crm_email_campaign_logs"

    id = db.Column(db.Integer, primary_key=True)
    campaign_name = db.Column(db.String(255), nullable=True)
    subject = db.Column(db.String(255), nullable=False)
    body_template = db.Column(db.Text, nullable=False)
    recipient_email = db.Column(db.String(255), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("crm_customer_info.id"), nullable=True)
    status = db.Column(db.String(50), default="SENT")  # SENT, FAILED, DRY_RUN
    error_message = db.Column(db.Text, nullable=True)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "campaign_name": self.campaign_name,
            "subject": self.subject,
            "recipient_email": self.recipient_email,
            "customer_id": self.customer_id,
            "status": self.status,
            "error_message": self.error_message,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None
        }

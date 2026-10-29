import os
import smtplib
import ssl
import time
import threading
from email.message import EmailMessage
from models.customer import Customer
from models.email_log import EmailCampaignLog
from database.connection import db

class EmailService:

    @staticmethod
    def render_template(text, customer):
        if not text:
            return ""
        name = customer.name if customer and customer.name else "Valued Client"
        company = customer.company if customer and customer.company else "Organization"
        state = customer.state if customer and customer.state else "Active"
        email = customer.email if customer and customer.email else ""

        rendered = str(text)
        rendered = rendered.replace("{name}", name)
        rendered = rendered.replace("{company}", company)
        rendered = rendered.replace("{state}", state)
        rendered = rendered.replace("{email}", email)
        return rendered

    @classmethod
    def send_campaign_batch(cls, app, customer_ids, subject_template, body_template, campaign_name="AI Email Campaign", dry_run=False):
        """
        Asynchronous background task to send personalized emails sequentially.
        """
        def worker():
            with app.app_context():
                print(f"[Email Campaign Worker Started] Target count: {len(customer_ids)}")

                smtp_server = os.getenv("SMTP_SERVER", "smtpout.secureserver.net")
                smtp_port = int(os.getenv("SMTP_PORT", "465"))
                sender_email = os.getenv("SENDER_EMAIL", "noreply@crm.com")
                sender_password = os.getenv("SENDER_PASSWORD", "")

                smtp_conn = None
                if not dry_run and sender_password:
                    try:
                        if smtp_port == 465:
                            smtp_conn = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=15)
                        else:
                            smtp_conn = smtplib.SMTP(smtp_server, smtp_port, timeout=15)
                            smtp_conn.starttls(context=ssl.create_default_context())
                        smtp_conn.login(sender_email, sender_password)
                        print("SMTP connection established.")
                    except Exception as e:
                        print(f"SMTP Connection Error: {e}")
                        smtp_conn = None

                customers = Customer.query.filter(Customer.id.in_(customer_ids)).all()

                for idx, customer in enumerate(customers, start=1):
                    if not customer.email or "@" not in customer.email:
                        print(f"Skipping customer {customer.id} ({customer.name}): Invalid email")
                        log = EmailCampaignLog(
                            campaign_name=campaign_name,
                            subject=subject_template,
                            body_template=body_template,
                            recipient_email=customer.email or "N/A",
                            customer_id=customer.id,
                            status="SKIPPED",
                            error_message="Missing or invalid email address"
                        )
                        db.session.add(log)
                        db.session.commit()
                        continue

                    # Render personalized subject & body
                    personalized_subject = cls.render_template(subject_template, customer)
                    personalized_body = cls.render_template(body_template, customer)

                    if dry_run or not smtp_conn:
                        print(f"[DRY-RUN / SIMULATED SEND] {idx}/{len(customers)} To: {customer.email} | Subject: {personalized_subject}")
                        log = EmailCampaignLog(
                            campaign_name=campaign_name,
                            subject=personalized_subject,
                            body_template=personalized_body,
                            recipient_email=customer.email,
                            customer_id=customer.id,
                            status="SENT" if dry_run else "SIMULATED_SENT",
                            error_message="Dry run simulation successful" if dry_run else "No SMTP credentials provided - simulated success"
                        )
                        db.session.add(log)
                        db.session.commit()
                    else:
                        try:
                            msg = EmailMessage()
                            msg["From"] = sender_email
                            msg["To"] = customer.email
                            msg["Subject"] = personalized_subject
                            msg.set_content(personalized_body)

                            smtp_conn.send_message(msg)
                            print(f"[SENT SMTP] {idx}/{len(customers)} To: {customer.email}")

                            log = EmailCampaignLog(
                                campaign_name=campaign_name,
                                subject=personalized_subject,
                                body_template=personalized_body,
                                recipient_email=customer.email,
                                customer_id=customer.id,
                                status="SENT"
                            )
                            db.session.add(log)
                            db.session.commit()
                        except Exception as err:
                            print(f"Failed to send email to {customer.email}: {err}")
                            log = EmailCampaignLog(
                                campaign_name=campaign_name,
                                subject=personalized_subject,
                                body_template=personalized_body,
                                recipient_email=customer.email,
                                customer_id=customer.id,
                                status="FAILED",
                                error_message=str(err)
                            )
                            db.session.add(log)
                            db.session.commit()

                    # Delay between emails to respect SMTP limits
                    time.sleep(1)

                if smtp_conn:
                    try:
                        smtp_conn.quit()
                    except Exception:
                        pass

                print(f"[Email Campaign Worker Finished] Campaign: {campaign_name}")

        thread = threading.Thread(target=worker)
        thread.daemon = True
        thread.start()
        return True

    @classmethod
    def test_connection(cls, recipient_email=None):
        """
        Tests connection to the configured SMTP server and optionally sends a test email.
        """
        smtp_server = os.getenv("SMTP_SERVER", "smtpout.secureserver.net")
        smtp_port = int(os.getenv("SMTP_PORT", "465"))
        sender_email = os.getenv("SENDER_EMAIL", "")
        sender_password = os.getenv("SENDER_PASSWORD", "")

        if not sender_email or not sender_password:
            return False, "SENDER_EMAIL and SENDER_PASSWORD must be configured in .env"

        try:
            print(f"Connecting to SMTP server {smtp_server}:{smtp_port}...")
            if smtp_port == 465:
                smtp = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=15)
            else:
                smtp = smtplib.SMTP(smtp_server, smtp_port, timeout=15)
                smtp.starttls(context=ssl.create_default_context())

            smtp.login(sender_email, sender_password)
            print("✅ SMTP Login Successful!")

            if recipient_email:
                msg = EmailMessage()
                msg["From"] = sender_email
                msg["To"] = recipient_email
                msg["Subject"] = "CRM GoDaddy SMTP Connection Test Successful"
                msg.set_content(f"Hello,\n\nThis email confirms that your GoDaddy SMTP configuration on server {smtp_server}:{smtp_port} is working correctly!\n\nSent from: {sender_email}")
                smtp.send_message(msg)
                print(f"✅ Test Email sent successfully to {recipient_email}")

            smtp.quit()
            return True, f"SMTP Connection to {smtp_server}:{smtp_port} verified successfully!"
        except Exception as e:
            print(f"❌ SMTP Connection Failed: {e}")
            return False, str(e)


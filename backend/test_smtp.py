import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import Config
from services.email_service import EmailService

def main():
    print("\n==============================================")
    print("  GoDaddy SMTP Email Configuration Test Tool  ")
    print("==============================================\n")

    print(f"SMTP Server   : {Config.SMTP_SERVER}")
    print(f"SMTP Port     : {Config.SMTP_PORT}")
    print(f"Sender Email  : {Config.SENDER_EMAIL or '(Not Configured)'}")
    print(f"Sender Name   : {Config.SENDER_NAME}")
    print(f"SSL Enabled   : {Config.SMTP_USE_SSL}")
    print(f"TLS Enabled   : {Config.SMTP_USE_TLS}\n")

    # Validate startup configuration
    valid = Config.validate_smtp_config()
    if not valid:
        print("\n❌ Environment validation failed. Please check backend/.env credentials.")
        return

    recipient = input("\nEnter recipient email for test message (press Enter to skip sending): ").strip()
    recipient_email = recipient if recipient else None

    print("\nAttempting connection to GoDaddy SMTP server...")
    success, message = EmailService.test_connection(recipient_email)

    if success:
        print(f"\n🎉 [SUCCESS] {message}")
    else:
        print(f"\n❌ [FAILURE] {message}")

if __name__ == "__main__":
    main()

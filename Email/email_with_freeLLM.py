import os, sys, time, yaml, csv, smtplib, ssl, mimetypes
import requests
import uuid
import json
import hashlib
import datetime
from email.message import EmailMessage
from dotenv import load_dotenv
from tkinter import simpledialog
import tkinter as tk
from datetime import datetime as dt

FREELLM_API_URL = "https://apifreellm.com/api/chat"

# ======================== UTILS ================================
def bail_out(msg):
    print(f"❌ ERROR: {msg}")
    print("⏳ Pausing 20 seconds before exit...")
    time.sleep(20)
    sys.exit(1)

def to_bool(val, default=False):
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        return val.strip().lower() in ("true", "yes", "y", "1")
    return default

# ======================== LICENSE CHECK ========================
def _get_my_mac():
    return ':'.join(
        ['{:02X}'.format((uuid.getnode() >> x) & 0xff)
         for x in range(0, 8 * 6, 8)][::-1]
    )

def check_license_file():
    if getattr(sys, "frozen", False):
        root_dir = os.path.dirname(sys.executable)
    else:
        root_dir = os.path.dirname(os.path.abspath(__file__))

    lic_file = os.path.join(root_dir, "license.lic")
    if not os.path.exists(lic_file):
        bail_out("License file missing. Contact flyingstockstechnologies.com")

    with open(lic_file, "r") as fh:
        lic_data = json.load(fh)

    mac_here = _get_my_mac().upper()
    mac_in_file = lic_data.get("mac", "").upper()
    print ("the mac in file is ",mac_in_file)
    print ("the mac_here  is ",mac_here)
    start_raw = lic_data.get("start_date")
    end_raw = lic_data.get("end_date")
    given_sig = lic_data.get("signature", "")

    if mac_here != mac_in_file:
        bail_out("License not valid for this machine.")

    today = datetime.datetime.now().date()
    start_dt = datetime.datetime.fromisoformat(start_raw).date()
    end_dt = datetime.datetime.fromisoformat(end_raw).date()

    if today < start_dt or today > end_dt:
        bail_out("License expired or not active.")

    expected = hashlib.sha256(f"{mac_in_file}{start_raw}{end_raw}".encode()).hexdigest()
    if expected != given_sig:
        bail_out("License signature invalid.")

    print(f"🔐 License validated (Valid until {end_raw})")

# ======================== CONFIG LOADER ========================
def load_config():
    base = os.path.dirname(sys.executable if getattr(sys, "frozen", False) else os.path.abspath(__file__))
    cfg_path = os.path.join(base, "config_email.yaml")
    if not os.path.exists(cfg_path):
        bail_out("config_email.yaml not found")

    with open(cfg_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    if not cfg or "smtp" not in cfg or "email" not in cfg:
        bail_out("Invalid config_email.yaml")
    return cfg

# ======================== AI PROMPT =============================
def build_email_prompt(topic):
    return f"""
Create a professional email using the placeholder {{name}} for the recipient's name.

Rules:
- One subject line
- Email body around 4 sentences
- Professional and clear tone
- Always use {{name}} in the greeting

Topic:
{topic}

Format EXACTLY:

SUBJECT:
<subject>

BODY:
<email body>
"""

# ======================== GEMINI ================================
def generate_with_gemini(topic):
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
    except ImportError:
        return None

    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            api_key=api_key,
            temperature=0.7
        )
        resp = llm.invoke(build_email_prompt(topic))
        return resp.content
    except Exception as e:
        print(f"❌ Gemini error: {e}")
        return None

# ======================== FREELLM ==============================
def generate_with_freellm(topic, max_retries=3):
    payload = {"message": build_email_prompt(topic)}
    headers = {"Content-Type": "application/json"}

    for attempt in range(1, max_retries + 1):
        try:
            r = requests.post(FREELLM_API_URL, json=payload, headers=headers, timeout=30)
            if r.status_code in (429, 500, 502, 503, 504):
                raise RuntimeError(f"Server error {r.status_code}")
            r.raise_for_status()
            data = r.json()
            if data.get("status") != "success":
                raise RuntimeError(data)
            return data.get("response")
        except Exception as e:
            print(f"⚠ FreeLLM error (attempt {attempt}/{max_retries}): {e}")
            time.sleep(20)
    return None

# ======================== UNIFIED AI GENERATOR =================
def generate_email_ai(topic, use_gemini):
    if use_gemini:
        print("🤖 Using Gemini...")
        text = generate_with_gemini(topic)
        if text:
            return text
    print("🤖 Using FreeLLM...")
    return generate_with_freellm(topic)

# ======================== CSV LOADER ============================
def load_csv_recipients(csv_path):
    recipients = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        field_map = {h.lower(): h for h in reader.fieldnames or []}
        if "email" not in field_map:
            bail_out("CSV must contain an 'email' column (case-insensitive)")
        email_col = field_map["email"]
        name_col = field_map.get("name")
        for row in reader:
            email_val = (row.get(email_col) or "").strip().lower()
            name_val = (row.get(name_col) or "").strip() if name_col else ""
            if email_val:
                recipients.append({"addr": email_val, "name": name_val})
    if not recipients:
        bail_out("CSV contains no valid email addresses")
    return recipients

# ======================== SMTP CONNECT =========================
def safe_close_smtp(smtp):
    if smtp:
        try:
            smtp.quit()
        except Exception:
            try:
                smtp.close()
            except Exception:
                pass

def connect_smtp(cfg, sender_email, password, max_retries=3, retry_delay=20):
    smtp_cfg = cfg["smtp"]
    server = smtp_cfg.get("server")
    port = smtp_cfg.get("port", 587)
    for attempt in range(1, max_retries + 1):
        try:
            if port == 465:
                smtp = smtplib.SMTP_SSL(server, port, timeout=30)
            else:
                smtp = smtplib.SMTP(server, port, timeout=30)
                smtp.starttls(context=ssl.create_default_context())
            smtp.login(sender_email, password)
            print("✅ SMTP login successful")
            return smtp
        except Exception as e:
            print(f"⚠ SMTP connection failed (attempt {attempt}/{max_retries}): {e}")
            if attempt < max_retries:
                print(f"⏳ Waiting {retry_delay} seconds before retrying...")
                time.sleep(retry_delay)
    bail_out("SMTP login failed after multiple attempts")

# ======================== EMAIL SENDER ==========================
def fire_email(entry, smtp_conn, cfg, sender_email, sender_password, dry, max_retries=3, retry_delay=30):
    msg = EmailMessage()
    msg["From"] = sender_email
    msg["To"] = entry["addr"]
    msg["Subject"] = entry["sub"]
    msg.set_content(entry["body"].replace("{name}", entry["name"] or "there"))

    if dry:
        print(f"[DRY RUN] Would send to {entry['addr']}")
        return True, smtp_conn

    for attempt in range(1, max_retries + 1):
        try:
            smtp_conn.send_message(msg)
            print(f"✔ Sent to {entry['addr']}")
            return True, smtp_conn
        except (smtplib.SMTPServerDisconnected, smtplib.SMTPConnectError, smtplib.SMTPHeloError, BrokenPipeError, ConnectionResetError) as e:
            print(f"⚠ SMTP disconnected: {e}")
            print("🔄 Reconnecting to SMTP server...")
            safe_close_smtp(smtp_conn)
            smtp_conn = connect_smtp(cfg, sender_email, sender_password)
        except smtplib.SMTPException as e:
            print(f"⚠ SMTP error sending to {entry['addr']} (attempt {attempt}/{max_retries}): {e}")
            if attempt < max_retries:
                print(f"🔄 Reconnecting SMTP server to open a new session and waiting {retry_delay} seconds...")
                safe_close_smtp(smtp_conn)
                time.sleep(retry_delay)
                smtp_conn = connect_smtp(cfg, sender_email, sender_password)
    print(f"❌ Failed permanently: {entry['addr']}")
    return False, smtp_conn

# ======================== STARTUP ==============================
check_license_file()
print("\n==============================")
print("   BULK EMAIL SENDER v1.5")
print("==============================\n")

cfg = load_config()
subject = cfg["email"]["default_subject"]
body = cfg["email"]["default_body"]
settings = cfg.get("settings", {})
dry_run = to_bool(settings.get("dry_run", False))
use_gemini_flag = to_bool(settings.get("use_gemini", False))
print(f"🤖 Gemini enabled: {use_gemini_flag}")

# ======================== AI GENERATION =======================
use_ai = input("Do you want AI-generated email content? (Y/N): ").strip().lower()
if use_ai == "y":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    while True:
        topic = input("Enter the email topic: ").strip()
        ai_text = generate_email_ai(topic, use_gemini_flag)

        if not ai_text:
            bail_out("AI generation failed")

        print("\n================ GENERATED EMAIL ================\n")
        print(ai_text)
        print("\n=================================================\n")

        choice = input("Satisfied? (Y = save / R = retry / E = exit): ").strip().lower()

        if choice == "y":
            fname = os.path.join(script_dir, f"ai_generated_email_{dt.now().strftime('%Y%m%d_%H%M%S')}.txt")
            with open(fname, "w", encoding="utf-8") as f:
                f.write(ai_text)
            print(f"✅ AI content saved to: {fname}")
            print("👉 Please copy SUBJECT and BODY into config_email.yaml before continuing.")
            input("Press ENTER once done...")
            cfg = load_config()
            subject = cfg["email"]["default_subject"]
            body = cfg["email"]["default_body"]
            break
        elif choice == "r":
            print("🔁 Retry selected. Enter a new topic.\n")
            continue
        elif choice == "e":
            sys.exit(0)
        else:
            print("⚠ Invalid choice. Please enter Y, R, or E.\n")

# ======================== CSV + SMTP ==========================
csv_path = input("\nEnter path to CSV file: ").strip()
if not os.path.exists(csv_path):
    bail_out("CSV file not found")

sender_email = input("Enter sender email: ").strip()
root = tk.Tk()
root.withdraw()
sender_password = simpledialog.askstring("Password", "Enter email password:", show="*")

recipients = load_csv_recipients(csv_path)
smtp_conn = connect_smtp(cfg, sender_email, sender_password)

# ======================== SEND LOOP ===========================
SEND_DELAY_SECONDS = cfg["smtp"].get("delay_between_emails", 10)
RECONNECT_EVERY = cfg["smtp"].get("reconnect_every", 20)
emails_sent = 0

for idx, r in enumerate(recipients, start=1):
    print(f"\n📤 Sending {idx}/{len(recipients)}: {r['addr']}")
    success, smtp_conn = fire_email(
        {
            "addr": r["addr"],
            "name": r["name"],
            "sub": subject,
            "body": body
        },
        smtp_conn,
        cfg,
        sender_email,
        sender_password,
        dry_run
    )
    emails_sent += 1
    print(f"⏳ Waiting {SEND_DELAY_SECONDS} seconds before next email...")
    time.sleep(SEND_DELAY_SECONDS)

    if emails_sent % RECONNECT_EVERY == 0 and idx != len(recipients):
        print(f"\n🔄 Reconnecting SMTP after {emails_sent} emails...")
        safe_close_smtp(smtp_conn)
        time.sleep(5)
        smtp_conn = connect_smtp(cfg, sender_email, sender_password)

safe_close_smtp(smtp_conn)
print("\n✅ All emails processed.")

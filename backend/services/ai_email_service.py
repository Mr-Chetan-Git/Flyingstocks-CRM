import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

FREELLM_API_URL = "https://apifreellm.com/api/chat"

class AIEmailService:

    @staticmethod
    def build_prompt(topic):
        sender_name = os.getenv("SENDER_NAME","Flying Stocks Technologies")
        return f"""
Create a professional and persuasive email campaign template based on the following topic.

Topic:
{topic}

Rules:
1. Always use standard placeholders:
   - Use {{name}} for the customer's full name or first name.
   - Use {{company}} for the customer's organization/company.
   - Use {{state}} for the customer's current status/state.
2. Sign off the email as "{sender_name}" or "{sender_name} Team".
3. Do NOT use square bracket placeholders like [Your Organization] or [Your Name].
4. Keep the email body structured, professional, and around 3-5 sentences long.
5. Output EXACTLY in JSON format with two keys: "subject" and "body". Do not include extra text outside the JSON object.

Example JSON Output:
{{
  "subject": "Exclusive Invitation: Software Architecture Workshop for {{name}}",
   "body": "Dear {{name}},\n\nWe noticed your team at {{company}} is scaling cloud infrastructure. We would love to invite you to our upcoming Architecture Workshop.\n\nBest regards,\n{sender_name} Team"
}}
"""

    @classmethod
    def generate_template(cls, topic):
        if not topic or not str(topic).strip():
            return None, "Campaign topic is required"

        prompt = cls.build_prompt(topic.strip())
        gemini_api_key = os.getenv("GEMINI_API_KEY")

        # 1. Primary: Use Google Gemini API if GEMINI_API_KEY is defined in backend/.env
        if gemini_api_key and gemini_api_key.strip():
            print("🤖 Using Google Gemini API (gemini-2.5-flash)...")
            try:
                gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_api_key.strip()}"
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
                r = requests.post(gemini_url, json=payload, headers={"Content-Type": "application/json"}, timeout=15)
                if r.status_code == 200:
                    res_data = r.json()
                    candidates = res_data.get("candidates", [])
                    if candidates:
                        raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        parsed = cls.parse_json_response(raw_text)
                        if parsed:
                            return parsed, None
            except Exception as e:
                print(f"❌ Gemini API Exception: {e}")

        # 2. Secondary Fallback: Use FreeLLM API if Gemini Key is missing or failed
        print("🤖 Using FreeLLM API fallback...")
        try:
            r = requests.post(
                FREELLM_API_URL,
                json={"message": prompt},
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            if r.status_code == 200:
                data = r.json()
                raw_text = data.get("response", "")
                parsed = cls.parse_json_response(raw_text)
                if parsed:
                    return parsed, None
        except Exception as e:
            print(f"⚠ FreeLLM API Exception: {e}")

        # 3. Dynamic Smart Template Fallback if both external APIs are unavailable
        fallback_template = {
            "subject": f"Special Offer & Update: {topic.strip()} for {{name}}",
            "body": f"Dear {{name}},\n\nWe are excited to share an update regarding {topic.strip()}.\n\nAs a valued partner at {{company}}, we believe this initiative aligns perfectly with your goals. Please let us know if you would like to schedule a quick demo or review further details.\n\nBest regards,\nThe CRM Account Team"
        }

        return fallback_template, None

    @staticmethod
    def parse_json_response(text):
        if not text:
            return None
        try:
            clean_text = text.strip()
            if "```json" in clean_text:
                clean_text = clean_text.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_text:
                clean_text = clean_text.split("```")[1].split("```")[0].strip()

            parsed = json.loads(clean_text)
            if "subject" in parsed and "body" in parsed:
                return {
                    "subject": str(parsed["subject"]).strip(),
                    "body": str(parsed["body"]).strip()
                }
        except Exception as e:
            print("Failed to parse AI JSON response:", e)
        return None

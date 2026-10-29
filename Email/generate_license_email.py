import json, hashlib


def generate_license(mac, start_date, end_date, output_path="license.lic"):
    mac = mac.upper().strip()

    # Signature protects against tampering
    signature = hashlib.sha256(f"{mac}{start_date}{end_date}".encode()).hexdigest()

    license_data = {
        "mac": mac,
        "start_date": start_date,
        "end_date": end_date,
        "signature": signature
    }

    with open(output_path, "w") as f:
        json.dump(license_data, f, indent=4)

    print("\n=== LICENSE GENERATED ===")
    print(f"File: {output_path}")
    print(f"MAC: {mac}")
    print(f"Start: {start_date}")
    print(f"End: {end_date}")
    print(f"Signature:\n{signature}\n")

def main():
    print("\n=== LICENSE GENERATOR ===\n")
    mac = input("Enter customer's MAC (AA:BB:CC:DD:EE:FF): ").strip()
    start_date = input("Start date (YYYY-MM-DD): ").strip()
    end_date = input("End date (YYYY-MM-DD): ").strip()

    generate_license(mac, start_date, end_date)

if __name__ == "__main__":
    main()


# & "C:\Users\Hp\AppData\Local\Programs\Python\Python313\python.exe" generate_license.py


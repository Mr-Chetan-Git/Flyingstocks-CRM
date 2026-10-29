import * as XLSX from "xlsx";

/**
 * Normalizes Excel row keys to match Customer model field names.
 */
function normalizeKeys(row) {
  const normalized = {};

  for (const key of Object.keys(row)) {
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    let targetField = "";

    if (cleanKey.includes("name")) targetField = "name";
    else if (cleanKey.includes("email")) targetField = "email";
    else if (cleanKey.includes("mobile") || cleanKey.includes("phone") || cleanKey.includes("contact")) targetField = "mobile";
    else if (cleanKey.includes("company") || cleanKey.includes("organization")) targetField = "company";
    else if (cleanKey.includes("designation") || cleanKey.includes("role") || cleanKey.includes("title")) targetField = "designation";
    else if (cleanKey.includes("state") || cleanKey.includes("status")) targetField = "state";
    else if (cleanKey.includes("comment") || cleanKey.includes("note")) targetField = "comments";
    else if (cleanKey.includes("predict")) targetField = "prediction";
    else if (cleanKey.includes("recommend") || cleanKey.includes("action")) targetField = "recommended_action";

    if (targetField) {
      const val = row[key];
      normalized[targetField] = typeof val === "string" ? val.trim() : (val !== undefined && val !== null ? String(val).trim() : "");
    }
  }

  return normalized;
}

/**
 * Validates an individual customer record.
 */
export function validateCustomerRecord(record) {
  const errors = [];

  // Required field: Name
  if (!record.name || record.name.trim() === "") {
    errors.push("Name is required");
  }

  // Email format check if provided
  if (record.email && record.email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(record.email.trim())) {
      errors.push("Invalid email format");
    }
  }

  // Mobile format check if provided
  if (record.mobile && record.mobile.trim() !== "") {
    const cleanMobile = record.mobile.replace(/[^0-9+-\s()]/g, "");
    if (cleanMobile.length < 5) {
      errors.push("Invalid phone number");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Reads and parses an Excel file (.xlsx or .xls).
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    const fileName = file.name || "";
    const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

    if (ext !== ".xlsx" && ext !== ".xls") {
      reject(new Error("Invalid file type. Only .xlsx and .xls files are supported."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error("Excel file is empty or corrupted."));
          return;
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          reject(new Error("No readable records found in the Excel sheet."));
          return;
        }

        const records = [];

        rawJson.forEach((row, index) => {
          // Check if row has any non-empty values
          const hasValues = Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== "");
          if (!hasValues) return; // Skip empty row

          const record = normalizeKeys(row);
          const validation = validateCustomerRecord(record);

          records.push({
            rowNumber: index + 2, // 1-indexed header + row index
            data: {
              name: record.name || "",
              email: record.email || "",
              mobile: record.mobile || "",
              company: record.company || "",
              designation: record.designation || "",
              state: record.state || "",
              comments: record.comments || "",
              prediction: record.prediction || "",
              recommended_action: record.recommended_action || ""
            },
            isValid: validation.isValid,
            errors: validation.errors
          });
        });

        if (records.length === 0) {
          reject(new Error("No valid data rows found in the selected Excel file."));
          return;
        }

        resolve(records);
      } catch (err) {
        reject(new Error("Failed to parse Excel file: " + err.message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

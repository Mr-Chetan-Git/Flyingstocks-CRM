import api from "./api";

// Generate AI Email Template from Topic
export async function generateEmailTemplate(topic) {
  const response = await api.post("/email/generate-template", { topic });
  return response.data;
}

// Send Email Campaign (Asynchronous Batch Delivery)
export async function sendEmailCampaign(campaignPayload) {
  const response = await api.post("/email/send-campaign", campaignPayload);
  return response.data;
}

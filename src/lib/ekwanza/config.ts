function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getEkwanzaConfig() {
  return {
    notificationToken: required("EKWANZA_NOTIFICATION_TOKEN"),
    apiKey: required("EKWANZA_API_KEY"),
    merchantRegistrationNumber: required("EKWANZA_MERCHANT_REGISTRATION_NUMBER"),
    merchantAccountNumber: required("EKWANZA_MERCHANT_ACCOUNT_NUMBER"),
    ticketApiBaseUrl: required("EKWANZA_TICKET_API_BASE_URL"),
  };
}

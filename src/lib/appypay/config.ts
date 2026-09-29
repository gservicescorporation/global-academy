function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAppyPayConfig() {
  return {
    oauthUrl: required("APPYPAY_OAUTH_URL"),
    chargesUrl: required("APPYPAY_CHARGES_URL"),
    clientId: required("APPYPAY_CLIENT_ID"),
    clientSecret: required("APPYPAY_CLIENT_SECRET"),
    resource: required("APPYPAY_RESOURCE"),
    paymentMethodRef: required("APPYPAY_PAYMENT_METHOD_REF"),
    paymentMethodGpo: required("APPYPAY_PAYMENT_METHOD_GPO"),
    merchantIdentifier: required("EKWANZA_MERCHANT_ACCOUNT_NUMBER"),
    apiKey: required("EKWANZA_API_KEY"),
  };
}

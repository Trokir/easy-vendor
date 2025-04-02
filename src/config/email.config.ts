export const emailConfig = {
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
    templates: {
      terms: process.env.SENDGRID_TERMS_TEMPLATE_ID,
      privacy: process.env.SENDGRID_PRIVACY_TEMPLATE_ID,
      cookies: process.env.SENDGRID_COOKIES_TEMPLATE_ID,
    },
  },
};

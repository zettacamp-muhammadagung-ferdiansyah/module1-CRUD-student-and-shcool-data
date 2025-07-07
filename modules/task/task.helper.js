// *************** IMPORT MODULE ***************
const sgMail = require('@sendgrid/mail');
const getConfig = require('../../core/config');
const { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } = getConfig();

// *************** DEBUG: Log the loaded SendGrid API Key and From Email
console.log('SENDGRID_API_KEY loaded:', SENDGRID_API_KEY);
console.log('SENDGRID_FROM_EMAIL loaded:', SENDGRID_FROM_EMAIL);
// *************** INIT SENDGRID
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Sends an email via SendGrid.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML body
 * @param {string} [options.from] - Sender email (defaults to no-reply)
 * @returns {Promise<void>}
 */
async function SendEmailViaSendGrid({ to, subject, html, from }) {
  try {
    const sender = from || SENDGRID_FROM_EMAIL || 'no-reply@example.com';
    const msg = { to, from: sender, subject, html };
    const sendMail = await sgMail.send(msg);
    return sendMail;
  } catch (error) {
    console.error('SendGrid Error:', error.response && error.response.body ? error.response.body : error.message);
    throw new Error('Failed to send email notification');
  }
}

module.exports = {
  SendEmailViaSendGrid,
};

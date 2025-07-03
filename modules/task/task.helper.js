// *************** IMPORT MODULE ***************
const sgMail = require('@sendgrid/mail');
const getConfig = require('../../core/config');
const { SENDGRID_API_KEY } = getConfig();

// *************** DEBUG: Log the loaded SendGrid API Key
console.log('SENDGRID_API_KEY loaded:', SENDGRID_API_KEY);
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
async function SendEmailViaSendGrid({ to, subject, html, from = 'afstory.121@gmail.com' }) {
  try {
    const msg = { to, from, subject, html };
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

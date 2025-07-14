// *************** IMPORT MODULE ***************
const sgMail = require("@sendgrid/mail");
const getConfig = require("../../core/config");
const { ApolloError } = require("apollo-server");
const { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } = getConfig();

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
    const sender = from || SENDGRID_FROM_EMAIL || "no-reply@example.com";
    const msg = { to, from: sender, subject, html };
    const sendMail = await sgMail.send(msg);
    return sendMail;
  } catch (error) {
    // *************** Log error to database
    const ErrorLogModel = require("../errorLogs/error_logs.model");
    await ErrorLogModel.create({
      path: "modules/task/task.helper.js",
      parameter_input: JSON.stringify({ to, subject, from }),
      function_name: "SendEmailViaSendGrid",
      error:
        error.response && error.response.body
          ? JSON.stringify(error.response.body)
          : String(error.stack || error.message),
    });

    // *************** Throw error with context
    throw new ApolloError(error.message);
  }
}

module.exports = {
  SendEmailViaSendGrid,
};

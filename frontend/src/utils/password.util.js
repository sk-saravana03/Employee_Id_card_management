/**
 * Generates a predefined password based on the user's first name and phone number.
 * Rule: First 4 letters of first name + Last 4 digits of phone number.
 * Example: Name: "Saravanan", Phone: "+91 9876543210" -> "Sara3210"
 *
 * @param {string} firstName
 * @param {string} phone
 * @returns {string} Predefined password string
 */
export const generatePredefinedPassword = (firstName = '', phone = '') => {
  const cleanName = (firstName || 'User')
    .trim()
    .replace(/[^a-zA-Z]/g, '');

  let namePart = cleanName.slice(0, 4);
  if (namePart.length < 4) {
    namePart = (namePart + 'User').slice(0, 4);
  }

  // Format first letter uppercase, rest lowercase
  const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();

  const digitsOnly = (phone || '').replace(/\D/g, '');
  const phonePart = digitsOnly.length >= 4 ? digitsOnly.slice(-4) : '1234';

  return `${formattedName}${phonePart}`;
};

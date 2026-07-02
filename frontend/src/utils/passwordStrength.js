/**
 * Calculates password complexity score (0–4).
 *
 * Scoring criteria:
 * - +1 for length >= 8 characters
 * - +1 for at least one uppercase letter
 * - +1 for at least one lowercase letter AND one digit
 * - +1 for at least one special (non-alphanumeric) character
 *
 * @param {string} pass - The password to evaluate
 * @returns {number} Score between 0 (empty) and 4 (strong)
 */
export const getPasswordStrengthScore = (pass) => {
  let score = 0;
  if (!pass) return score;

  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass) && /[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  return score;
};

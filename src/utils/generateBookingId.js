/**
 * Generate a human-readable booking ID
 * Format: BMP-YYYYMMDD-XXXX (e.g., BMP-20260211-A3F7)
 */
const generateBookingId = () => {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  // Generate 4-character alphanumeric suffix
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `BMP-${dateStr}-${suffix}`;
};

module.exports = generateBookingId;

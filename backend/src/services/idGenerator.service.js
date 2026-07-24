import mongoose from 'mongoose';

/**
 * Role name → 3-letter code mapping.
 * Matches the Role model enum values.
 */
const ROLE_CODE_MAP = {
  'Super Admin': 'SAD',
  'HR/Admin': 'HRA',
  'Printer Operator': 'POP',
  'Security Officer': 'SEC',
  Employee: 'EMP',
};

/**
 * Auto-increment counter schema.
 * Key format: "<ROLE_CODE>-<YY>" e.g. "EMP-26"
 */
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },   // e.g. "EMP-26"
  seq: { type: Number, default: 0 },
});

// Use existing model if already registered (hot-reload safe)
const Counter =
  mongoose.models.IdCounter || mongoose.model('IdCounter', CounterSchema);

/**
 * Generates a unique Employee ID.
 *
 * Format: [3-LETTER-ROLE-CODE][YY][6-DIGIT-SEQUENCE]
 * Example: EMP260000001, HRA260000003, SAD260000001
 *
 * @param {string} roleName - The role name string (e.g. "Employee", "HR/Admin")
 * @returns {Promise<string>} Generated ID string
 */
export const generateEmployeeId = async (roleName) => {
  const roleCode = ROLE_CODE_MAP[roleName];
  if (!roleCode) {
    throw new Error(
      `Unknown role "${roleName}". Cannot generate Employee ID. Valid roles: ${Object.keys(ROLE_CODE_MAP).join(', ')}`
    );
  }

  const now = new Date();
  // Two-digit year suffix (e.g. 2026 → "26")
  const yearSuffix = String(now.getFullYear()).slice(-2);
  const counterId = `${roleCode}-${yearSuffix}`;

  // Atomically find and increment the counter for this role+year
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Zero-pad the sequence to 6 digits → max 999,999 per role per year
  const seqPadded = String(counter.seq).padStart(6, '0');

  return `${roleCode}${yearSuffix}${seqPadded}`;
};

/**
 * Returns the 3-letter role code for a given role name.
 * Useful for validation without generating a full ID.
 *
 * @param {string} roleName
 * @returns {string|undefined}
 */
export const getRoleCode = (roleName) => ROLE_CODE_MAP[roleName];

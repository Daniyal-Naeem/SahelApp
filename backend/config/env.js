/**
 * Centralised environment configuration.
 *
 * Secrets have no development fallbacks on purpose: a missing value must fail
 * loudly at boot rather than silently signing tokens with a public constant.
 */

const requireEnv = (name) => {
    const value = process.env[name]
    if (!value) {
        throw new Error(
            `Missing required environment variable ${name}. See backend/.env.example.`
        )
    }
    return value
}

const JWT_SECRET = requireEnv('JWT_SECRET')
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Shared secret for the payment gateway webhook that confirms credit top-ups.
const TOPUP_WEBHOOK_SECRET = requireEnv('TOPUP_WEBHOOK_SECRET')

module.exports = {
    requireEnv,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    TOPUP_WEBHOOK_SECRET
}

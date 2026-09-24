const crypto = require('crypto')
const { TOPUP_WEBHOOK_SECRET } = require('../config/env')

/**
 * verifyTopupWebhook - authenticate the payment gateway's top-up callback.
 *
 * The gateway signs the raw request body with the shared secret and sends the
 * hex digest in `x-webhook-signature`. The raw body is captured by the
 * `verify` hook on express.json() in index.js.
 */
const verifyTopupWebhook = (req, res, next) => {
    const signature = req.headers['x-webhook-signature']

    if (!signature) {
        return res.status(401).json({ error: 'Missing webhook signature' })
    }

    if (!req.rawBody) {
        return res.status(400).json({ error: 'Unable to verify webhook payload' })
    }

    const expected = crypto
        .createHmac('sha256', TOPUP_WEBHOOK_SECRET)
        .update(req.rawBody)
        .digest('hex')

    const provided = Buffer.from(String(signature), 'utf8')
    const expectedBuffer = Buffer.from(expected, 'utf8')

    if (
        provided.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(provided, expectedBuffer)
    ) {
        return res.status(401).json({ error: 'Invalid webhook signature' })
    }

    next()
}

module.exports = { verifyTopupWebhook }

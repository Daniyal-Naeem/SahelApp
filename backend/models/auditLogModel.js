const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/**
 * Audit Log Model
 * Centralized audit logging for all financial/credit operations
 * Immutable records for compliance and investigation
 */
const auditLogSchema = new Schema({
    // Action type
    action: {
        type: String,
        required: true,
        enum: [
            'credit_topup',
            'credit_transfer',
            'credit_consume',
            'credit_refund',
            'credit_adjust',
            'wallet_create',
            'wallet_update',
            'order_create',
            'order_cancel',
            'payment_process',
            'admin_action'
        ],
        index: true
    },
    // User who performed the action
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        index: true
    },
    // Admin who performed the action (if applicable)
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        index: true
    },
    // Related transaction
    transactionId: {
        type: Schema.Types.ObjectId,
        ref: 'creditTransactionModel'
    },
    // Related order
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'orderModel'
    },
    // Action details
    details: {
        type: Schema.Types.Mixed,
        required: true
    },
    // Status
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'success',
        index: true
    },
    // Error information (if failed)
    error: {
        message: String,
        code: String,
        stack: String
    },
    // Request metadata
    requestMeta: {
        ipAddress: String,
        userAgent: String,
        deviceId: String,
        location: String,
        method: String,
        path: String
    },
    // Changes made (before/after for updates)
    changes: {
        before: Schema.Types.Mixed,
        after: Schema.Types.Mixed
    },
    // Reason for action (especially for admin actions)
    reason: {
        type: String
    }
}, { 
    timestamps: true,
    collection: 'audit_logs'
})

// Indexes for performance
auditLogSchema.index({ userId: 1, createdAt: -1 })
auditLogSchema.index({ adminId: 1, createdAt: -1 })
auditLogSchema.index({ action: 1, createdAt: -1 })
auditLogSchema.index({ status: 1, createdAt: -1 })
auditLogSchema.index({ transactionId: 1 })
auditLogSchema.index({ orderId: 1 })
auditLogSchema.index({ createdAt: -1 })

// Static method to create audit log
auditLogSchema.statics.log = async function(data) {
    return await this.create(data)
}

module.exports = mongoose.model("auditLogModel", auditLogSchema)








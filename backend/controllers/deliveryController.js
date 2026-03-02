const mongoose = require('mongoose')
const orderModel = require('../models/orderModel')

/**
 * Delivery Controller
 * Handles delivery person assignment and location tracking
 */

/**
 * Assign delivery person to order (admin/vendor only)
 * PUT /api/delivery/:orderId/assign
 */
const assignDeliveryPerson = async (req, res) => {
    try {
        const { orderId } = req.params
        const { name, phone, vehicleNumber } = req.body

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' })
        }

        if (!name || !phone) {
            return res.status(400).json({ error: 'Delivery person name and phone are required' })
        }

        const order = await orderModel.findById(orderId)
        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        // Only assign to orders that are processing, shipped, or out for delivery
        if (!['processing', 'shipped'].includes(order.status)) {
            return res.status(400).json({
                error: 'Can only assign delivery person to orders that are processing or shipped'
            })
        }

        // Update delivery person
        order.deliveryPerson = {
            name: name.trim(),
            phone: phone.trim(),
            vehicleNumber: vehicleNumber ? vehicleNumber.trim() : undefined
        }

        // Update order status to shipped if it was processing
        if (order.status === 'processing') {
            order.status = 'shipped'
            order.shippedAt = new Date()
        }

        await order.save()

        return res.status(200).json({
            message: 'Delivery person assigned successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                deliveryPerson: order.deliveryPerson,
                shippedAt: order.shippedAt
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Update delivery location (for delivery person app or admin)
 * PUT /api/delivery/:orderId/location
 */
const updateDeliveryLocation = async (req, res) => {
    try {
        const { orderId } = req.params
        const { address, latitude, longitude } = req.body

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' })
        }

        if (!address) {
            return res.status(400).json({ error: 'Address is required' })
        }

        const order = await orderModel.findById(orderId)
        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        // Only update location for orders that are shipped
        if (order.status !== 'shipped') {
            return res.status(400).json({
                error: 'Can only update location for shipped orders'
            })
        }

        // Update current location
        order.currentLocation = {
            address: address.trim(),
            coordinates: latitude && longitude ? {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            } : undefined,
            lastUpdated: new Date()
        }

        await order.save()

        return res.status(200).json({
            message: 'Delivery location updated successfully',
            currentLocation: order.currentLocation
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Mark order as delivered (delivery person or admin)
 * PUT /api/delivery/:orderId/deliver
 */
const markOrderDelivered = async (req, res) => {
    try {
        const { orderId } = req.params
        const { deliveryNotes } = req.body

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' })
        }

        const order = await orderModel.findById(orderId)
        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        // Only mark as delivered if order is shipped
        if (order.status !== 'shipped') {
            return res.status(400).json({
                error: 'Can only mark shipped orders as delivered'
            })
        }

        // Update order status
        order.status = 'delivered'
        order.deliveredAt = new Date()

        if (deliveryNotes) {
            order.notes = (order.notes ? order.notes + '\n' : '') +
                         `Delivered: ${deliveryNotes.trim()}`
        }

        await order.save()

        return res.status(200).json({
            message: 'Order marked as delivered successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                deliveredAt: order.deliveredAt
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Get delivery details for an order (public for order owner, admin for all)
 * GET /api/delivery/:orderId
 */
const getDeliveryDetails = async (req, res) => {
    try {
        const { orderId } = req.params
        const userId = req.user?.userId
        const userRole = req.user?.role

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' })
        }

        const order = await orderModel.findById(orderId)
            .select('user orderNumber status deliveryPerson currentLocation shippedAt deliveredAt')
            .populate('user', 'name email')

        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        // Check permissions
        if (userRole !== 'admin' && order.user._id.toString() !== userId) {
            return res.status(403).json({ error: 'Access denied' })
        }

        return res.status(200).json({
            orderNumber: order.orderNumber,
            status: order.status,
            deliveryPerson: order.deliveryPerson,
            currentLocation: order.currentLocation,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    assignDeliveryPerson,
    updateDeliveryLocation,
    markOrderDelivered,
    getDeliveryDetails
}

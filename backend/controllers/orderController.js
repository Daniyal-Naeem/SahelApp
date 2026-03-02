const mongoose = require('mongoose')
const orderModel = require('../models/orderModel')
const productsModel = require('../models/productsModel')

/**
 * createOrder,
 * getAllOrders,
 * getSingleOrder,
 * getUserOrders,
 * updateOrderStatus,
 * cancelOrder
 */

// Create new order
const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, notes } = req.body;
        const userId = req.user.userId;

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Order items are required" })
        }

        // Validate and calculate order items
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await productsModel.findById(item.productId)
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.productId} not found` })
            }

            const quantity = item.quantity || 1;
            const price = product.price;
            const total = price * quantity;

            orderItems.push({
                product: product._id,
                quantity,
                price,
                total
            });

            subtotal += total;
        }

        // Calculate shipping cost (can be customized)
        const shippingCost = shippingAddress ? 10 : 0; // Default shipping cost
        const total = subtotal + shippingCost;

        // Create order
        const newOrder = await orderModel.create({
            user: userId,
            items: orderItems,
            subtotal,
            shippingCost,
            total,
            shippingAddress: shippingAddress || {},
            paymentMethod: paymentMethod || 'credit',
            notes: notes || ""
        })

        // Populate product details
        await newOrder.populate('items.product', 'title image price')
        await newOrder.populate('user', 'name email')

        return res.status(201).json({
            message: "Order created successfully",
            order: newOrder
        })

    } catch (error) {
        let errorMessage = "";
        if (error.errors) {
            errorMessage = Object.values(error.errors).map(error => error.message).join(", ")
        } else {
            errorMessage = error.message;
        }
        res.status(500).json({ error: errorMessage })
    }
}

// Get all orders (admin/vendor only)
const getAllOrders = async (req, res) => {
    try {
        const { status, paymentStatus } = req.query;
        const userRole = req.user.role;

        let query = {};
        
        // Vendors can only see orders with their products
        if (userRole === 'vendor') {
            // This would need product-vendor relationship
            // For now, vendors see all orders
        }

        if (status) {
            query.status = status;
        }
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        const orders = await orderModel.find(query)
            .populate('user', 'name email phone')
            .populate('items.product', 'title image price')
            .sort({ createdAt: -1 })

        if (orders.length === 0) {
            return res.status(404).json({ message: "No Orders Found" })
        }

        return res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get single order by ID
const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }

        const order = await orderModel.findById(id)
            .populate('user', 'name email phone address')
            .populate('items.product', 'title image price description')

        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        // Users can only see their own orders (unless admin/vendor)
        if (userRole === 'user' && order.user._id.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Access denied" })
        }

        return res.status(200).json(order)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get user's own orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status } = req.query;

        let query = { user: userId };
        if (status) {
            query.status = status;
        }

        const orders = await orderModel.find(query)
            .populate('items.product', 'title image price')
            .sort({ createdAt: -1 })

        return res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Update order status (admin/vendor only)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber, notes } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No such ID" })
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (notes !== undefined) updateData.notes = notes;

        // Set dates based on status
        if (status === 'shipped') {
            updateData.shippedAt = new Date();
        }
        if (status === 'delivered') {
            updateData.deliveredAt = new Date();
            updateData.paymentStatus = 'paid';
        }
        
        // Auto-assign VIP if payment status is being set to 'paid'
        if (updateData.paymentStatus === 'paid' || (status === 'delivered' && updateData.paymentStatus === 'paid')) {
            const { checkAndAutoAssignVIP } = require('../utils/vipAutoAssignment');
            const order = await orderModel.findById(id);
            if (order && order.user) {
                try {
                    await checkAndAutoAssignVIP(order.user.toString());
                } catch (vipError) {
                    console.error('Error auto-assigning VIP:', vipError);
                    // Don't fail the order update if VIP assignment fails
                }
            }
        }

        // Get order before update to check user
        const orderBeforeUpdate = await orderModel.findById(id);
        
        const updatedOrder = await orderModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('user', 'name email')
            .populate('items.product', 'title image price')

        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" })
        }

        // Auto-assign VIP if payment status is being set to 'paid'
        if (updateData.paymentStatus === 'paid' && orderBeforeUpdate && orderBeforeUpdate.user) {
            const { checkAndAutoAssignVIP } = require('../utils/vipAutoAssignment');
            try {
                await checkAndAutoAssignVIP(orderBeforeUpdate.user.toString());
            } catch (vipError) {
                console.error('Error auto-assigning VIP:', vipError);
                // Don't fail the order update if VIP assignment fails
            }
        }

        return res.status(200).json({
            message: "Order updated successfully",
            order: updatedOrder
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }

        const order = await orderModel.findById(id)
        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        // Users can only cancel their own orders (unless admin)
        if (userRole === 'user' && order.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only cancel your own orders" })
        }

        // Only pending or confirmed orders can be cancelled
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({ error: "Order cannot be cancelled at this stage" })
        }

        const cancelledOrder = await orderModel.findByIdAndUpdate(
            id,
            { status: 'cancelled' },
            { new: true }
        )
            .populate('user', 'name email')
            .populate('items.product', 'title image price')

        return res.status(200).json({
            message: "Order cancelled successfully",
            order: cancelledOrder
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    createOrder,
    getAllOrders,
    getSingleOrder,
    getUserOrders,
    updateOrderStatus,
    cancelOrder
}



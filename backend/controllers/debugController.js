const userModel = require('../models/userModel');

const debugUser = async (req, res) => {
    try {
        const email = 'admin@sahal.com';
        const password = 'admin123';
        
        // Find user
        const user = await userModel.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.json({
                status: 'error',
                message: 'User not found',
                email: email
            });
        }
        
        // Check password
        const isValid = await user.comparePassword(password);
        
        return res.json({
            status: 'success',
            userFound: true,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            passwordValid: isValid,
            passwordHashStart: user.password ? user.password.substring(0, 20) : 'NONE'
        });
        
    } catch (error) {
        return res.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
};

module.exports = { debugUser };


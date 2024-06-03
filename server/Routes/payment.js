const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Product = require('../models/payment');
// const dotenv = require('dotenv').config();
const { promisify } = require('util');

const instance = new Razorpay({
    key_id: "rzp_test_3odnVFzUBOioFh",
    key_secret: "h1Pb26TpVmjw1AIEc2SjFyrf",
});

// Promisify the create order method
const createOrder = promisify(instance.orders.create.bind(instance));

router.post('/orders', async (req, res) => {
    try {
        const { amount,name } = req.body;

        // Log the request body
        console.log('Request body:', req.body);

        if (!name || !amount) {
            return res.status(400).json({ message: 'Name and amount are required' });
        }

        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: 'INR',
            receipt: crypto.randomBytes(10).toString('hex'),
        };

        const order = await createOrder(options);

        // Save product details to the database
        const product = new Product({
            name,
            price: amount,
            razorpayOrderId: order.id,
        });

        await product.save();

        res.status(200).json({ data: order });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', "h1Pb26TpVmjw1AIEc2SjFyrf")
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ message: 'Payment verified ' });
        } else {
            return res.status(400).json({ message: 'Invalid signature sent!' });s
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
});

module.exports = router;

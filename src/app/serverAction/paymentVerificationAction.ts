"use server"
import crypto from 'crypto';

async function verifyPayment(payment_id: string, order_id: string, exceptSignature: string) {
    const body = `${order_id}|${payment_id}`;

    // create signature for verification
    const generateSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET!)
        .update(body.toString())
        .digest("hex");

    if (exceptSignature === generateSignature) {
        return {
            success: true,
            message: "Payment Successful! Credits will be updated shortly via Webhook."
        }
    }

    else {
        return { success: false, message: "Invalid signature" };
    }
};

export default  verifyPayment;
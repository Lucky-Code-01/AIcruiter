import { NextResponse } from "next/server";
import dbConnection from "@/utils/Connection";
import crypto from 'crypto';
import UserModel from "@/models/userModel";

export async function POST(req: Request) {
    try {

        const rawBody = await req.text();
        console.log("RawBody :- ", rawBody);
        const signature = req.headers.get("x-razorpay-signature");

        console.log("👉 Webhook Received!");
        console.log("Header Signature:", signature);

        if (!signature) {
            return NextResponse.json({ error: "No signature provided" }, { status: 400 });
        }

        // make excepted signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(rawBody)
            .digest("hex");


        console.log("your backend expected signature :- ", expectedSignature);

        if (expectedSignature !== signature) {
            console.error("Invalid Webhook Signature!");
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        //event parse
        const event = JSON.parse(rawBody);
        
        console.log("your event :- ", event);

        await dbConnection();

        switch (event.event) {

            // EVENT 1 & 2: Payment Successful (Credits Add Karo)
            case "payment.captured":
            case "order.paid": {
                const payment = event.payload.payment?.entity;
                const userId = payment?.notes?.userId;
                const creditsToAdd = Number(payment?.notes?.credit);

                console.log(`💰 Success Event: ${event.event} for Order ID: ${payment?.order_id}`);

                if (userId && creditsToAdd) {
                    await UserModel.findByIdAndUpdate(
                        userId,
                        { $inc: { credit: creditsToAdd } }, 
                        { new: true }
                    );
                    console.log(`✅ ${creditsToAdd} Credits added successfully to User ${userId}!`);
                }
                break;
            }

            // EVENT 3: Payment Failed / Error
            case "payment.failed": {
                const failedPayment = event.payload.payment?.entity;
                const userId = failedPayment?.notes?.userId;
                const reason = failedPayment?.error_description || "Unknown Reason";

                console.error(` Payment Failed for User ${userId}. Reason: ${reason}`);

                break;
            }

            default:
                console.log(`Unhandled Event: ${event.event}`);
        }

        return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    catch (error) {
        console.log("Your error :- ", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
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
        if (event.event === "payment captured") {
            const paymentEntity = event.payload.payment.entity;
            console.log("💰 Payment Captured for Order ID:", paymentEntity.order_id);
            const userId = paymentEntity.notes?.userId;
            const creditsToAdd = Number(paymentEntity.notes?.credit);

            if (userId && creditsToAdd) {
                await dbConnection();

                // Database mein User ke credits update karo
                await UserModel.findByIdAndUpdate(userId, {
                    $inc: { credits: creditsToAdd },
                });

                console.log(`✅ WEBHOOK SUCCESS: Added ${creditsToAdd} credits to User ${userId}`);
            }
        }

        return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    catch (error) {
        console.log("Your error :- ", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
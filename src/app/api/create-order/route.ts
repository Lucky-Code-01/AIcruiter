import { NextResponse } from "next/server";
import dbConnection from '@/utils/Connection';
import Razorpay from 'razorpay';
import { PLANS } from '@/app/plan';

const razorPay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

export async function POST(req: Request) {
    await dbConnection();

    try {
        const { planId, userId } = await req.json();

        if ((!planId && planId.length == 0) ||
            (!userId && userId.length == 0)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "planId and UserId are required",
                },
                { status: 400 }
            );
        }

        // verify plan in our system
        const verifyPlan = Object.values(PLANS).find((plan)=> plan.planId == planId);

        if(!verifyPlan){
            return NextResponse.json({
                success: false,
                message: "Invalid Plan Selected"
            }, {status: 400})
        }

        // here prepared order
        const options = {
            amount: verifyPlan.amountInINR * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes:{
                userId: userId,
                planid: verifyPlan.planId,
                credit: verifyPlan.amountInINR
            }
        };

        const order = await razorPay.orders.create(options);

        // return order
        return NextResponse.json({
            orderId: order.id,
            message: "Order create successfully!!",
            amount: order.amount,
            success: true,
            currency: order.currency
        })
    }

    catch (error) {
        console.log("your error :- ", error);
    }
}
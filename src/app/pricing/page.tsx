"use client";

import { PLANS } from "@/app/plan";
import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import Script from "next/script";
import axios from "axios";

import verifyPayment from "../serverAction/paymentVerificationAction";

export default function PricingPage() {

  const freePlan = {
    planId: "free_pack",
    title: "Free",
    price: "₹0",
    credits: "100 Credits",
    description: "Perfect for beginners starting interview preparation.",
    features: [
      "100 AI Interview Credits",
      "Basic Performance Report",
      "Voice Interview Access",
      "Limited History Tracking",
    ],
    tag: "Default",
  };

  const { data: session, status } = useSession();
  const user = session?.user;
  const userId = user?._id;


  // Payment Handler (Jab user "Select Plan" par click karega)
  const handleBuyCredit = async (planId: string) => {

    if (!(window as any).Razorpay) {
      alert("Razorpay SDK failed to load. Please check your connection!");
      return;
    }

    try {
      const creditInfo = {
        planId,
        userId
      };
      const response = await axios.post('/api/create-order', creditInfo);

      const { orderId, amount, currency } = response.data;

      // Razorpay option for payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "InterviewIQ.AI",
        description: "Purchase Interview Credits",
        order_id: orderId,
        handler: async function (paymentResponse: any) {
          console.log("your success payment response :- ", paymentResponse);

          const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = paymentResponse;

          const response = await verifyPayment(razorpay_payment_id,razorpay_order_id,razorpay_signature);

          if(response.success){
            alert(response.message || "Your payment has complete and verify!!");
          }
          else{
            alert(response.message || "Your payment has failed!!");
          }

        },

        prefill: {
          email: user.email
        }
      };

      // here open razor pay model box
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    }
    catch (error) {
      console.log("your error message :- ", error);
      alert("Order creation failed. Please try again.");
    }
  };


  return (

    <>
      {/* Razorpay transaction payment popup box script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload"></Script>

      <div className="min-h-screen bg-linear-to-b from-gray-50 to-green-50 flex flex-col items-center py-16 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600 mb-10 text-center">
          Flexible pricing to match your interview preparation goals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {/* 1. FREE PLAN CARD */}
          <div className="bg-white shadow-md rounded-xl p-6 border hover:shadow-lg transition-all duration-300 relative">
            <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
              {freePlan.tag}
            </span>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {freePlan.title}
            </h2>
            <p className="text-3xl font-bold text-green-600 mb-1">{freePlan.price}</p>
            <p className="text-sm text-gray-500 mb-4">{freePlan.credits}</p>
            <p className="text-gray-600 mb-6">{freePlan.description}</p>

            <ul className="space-y-2 mb-6">
              {freePlan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2"><Check /></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* 2. PAID PLANS CARDS */}
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.planId}
              className="bg-white shadow-md rounded-xl p-6 border hover:shadow-lg transition-all duration-300 relative"
            >
              {/* Tag (For Pro Plan / Best Value) */}
              {plan.planId === "pro_pack" && (
                <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                  Best Value
                </span>
              )}

              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {plan.name}
              </h2>
              <p className="text-3xl font-bold text-green-600 mb-1">
                ₹{plan.amountInINR}
              </p>
              <p className="text-sm text-gray-500 mb-4">{plan.credits} Credits</p>

              <p className="text-gray-600 mb-6">
                {plan.planId === "starter_pack"
                  ? "Great for focused practice and skill improvement."
                  : "Best value for serious job preparation."}
              </p>

              <ul className="space-y-2 mb-6">
                {/* Common / Plan Features */}
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2"><Check /></span>
                  {plan.credits} AI Interview Credits
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2"><Check /></span>
                  {plan.planId === "pro_pack" ? "Advanced AI Feedback" : "Detailed Feedback"}
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2"><Check /></span>
                  {plan.planId === "pro_pack" ? "Skill Trend Analysis" : "Performance Analytics"}
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2"><Check /></span>
                  {plan.planId === "pro_pack" ? "Priority AI Processing" : "Full Interview History"}
                </li>
              </ul>

              <button
                onClick={() => handleBuyCredit(plan.planId)}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </>

  );
};
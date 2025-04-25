"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const PricingSection = () => {
  const { data: session, update } = useSession();
  const user = session?.user;
  const [isFreeLoading, setIsFreeLoading] = useState(false);
  const [isProLoading, setIsProLoading] = useState(false);

  const handlePayment = async (plan) => {
    if (plan === "free") {
      try {
        setIsFreeLoading(true);
        const response = await fetch("/api/update-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planName: "free",
          }),
        });

        const data = await response.json();

        if (data.success) {
          await update({
            user: {
              ...session.user,
              plan: data.user.plan,
            },
          });
  
          toast.success("Successfully switched to Free plan");
        } else {
          toast.error(data.message || "Failed to update plan");
        }
      } catch (error) {
        console.error("Error updating plan:", error);
        toast.error("Failed to update plan");
      } finally {
        setIsFreeLoading(false);
      }
      return;
    }

    try {
      setIsProLoading(true);
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 0.01, // Amount in rupees
          currency: "INR",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "InvisiFeed",
        description: "Pro Plan Subscription",
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              await update({
                user: {
                  ...session.user,
                  plan: verifyData.user.plan,
                },
              });
      
              toast.success("You've successfully upgraded to Pro Plan!");
            } else {
              toast.error(verifyData.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error("Failed to verify payment");
          }
        },
        prefill: {
          name: user?.organizationName,
          email: user?.email,
          contact: user?.phoneNumber,
        },
        theme: {
          color: "#F59E0B",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      setIsProLoading(false);
    }
  };

  const isProPlan = user?.plan?.planName === "pro";
  const isFreePlan = user?.plan?.planName === "free";

  return (
    <section className="py-24 bg-[#0A0A0A] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Choose the plan that works best for your business
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-8 h-full">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-yellow-400">₹0</span>
                </div>
                <p className="text-gray-400">
                  Perfect for freelancers and businesses just getting started
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited feedback collection",
                  "Basic analytics dashboard",
                  "Standard feedback form",
                  "Create upto 3 Invoices daily",
                  "Feedback filters and sorting",
                  "Email support",
                  "Coupon management",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePayment("free")}
                disabled={isFreeLoading || isFreePlan || isProPlan}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center bg-transparent border-2 border-yellow-400/20 text-yellow-400 hover:border-yellow-400/40 ${
                  (isFreeLoading || isFreePlan) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span>
                  {isFreeLoading
                    ? "Processing..."
                    : isFreePlan
                    ? "You're on Free Plan"
                    : "Pro Plan is Active"}
                </span>
                {!isFreeLoading && !isFreePlan && <ArrowRight className="w-4 h-4 ml-2" />}
              </motion.button>
            </div>
          </motion.div>

          {/* Pro Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/30 shadow-lg shadow-yellow-400/10 rounded-xl p-8 h-full">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-yellow-400">₹299</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <p className="text-gray-400">
                  Ideal for growing businesses and service providers
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free plan",
                  "Advanced analytics dashboard",
                  "Monthly reports",
                  "Customized feedback forms",
                  "Multiple Invoice templates",
                  "No daily limit on Invoices",
                  "Customer query management",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePayment("pro")}
                disabled={isProLoading || isProPlan}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 shadow-lg shadow-yellow-500/20 ${
                  (isProLoading || isProPlan) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span>
                  {isProLoading
                    ? "Processing..."
                    : isProPlan
                    ? "Already Subscribed"
                    : "Subscribe to Pro"}
                </span>
                {!isProLoading && !isProPlan && <ArrowRight className="w-4 h-4 ml-2" />}
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Need a custom plan for your enterprise?{" "}
            <a href="#" className="text-yellow-400 hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 
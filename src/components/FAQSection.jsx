import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What kind of invoices are supported?",
    answer:
      "InvisiFeed supports all valid invoices in PDF format. Our system is designed to work with standard invoice layouts and can extract invoice numbers automatically.",
  },
  {
    question: "Can customers submit feedback without email/login?",
    answer:
      "Yes, absolutely! One of the key benefits of InvisiFeed is that customers can submit feedback anonymously without creating an account or providing their email address. They simply scan the QR code on the invoice and provide their feedback.",
  },
  {
    question: "Is feedback completely anonymous?",
    answer:
      "Yes, feedback is completely anonymous. We don't collect or store any personal information from your customers when they submit feedback. This encourages honest and candid responses.",
  },
  {
    question: "Are coupons required?",
    answer:
      "No, coupons are completely optional. You can choose to offer incentives to customers who submit feedback, but it's not required. You have full control over whether to include coupons and what they offer.",
  },
  {
    question: "How secure is my data?",
    answer:
      "We take security very seriously. All data is encrypted using industry-standard protocols, and we don't permanently store your invoices. Your data is owned and controlled by you, and we adhere to GDPR regulations to ensure your information is protected.",
  },
  {
    question: "How does the AI-generated feedback form work?",
    answer:
      "Our AI analyzes your business type and industry to generate relevant feedback questions. The form adapts to your specific service offerings, ensuring you get the most valuable insights from your customers.",
  },
  {
    question: "Can I customize the feedback form?",
    answer:
      "Yes, you can customize the AI-generated feedback form to include specific questions or areas you want to focus on. This allows you to gather targeted feedback on aspects of your service that matter most to you.",
  },
  {
    question: "How do I access the feedback analytics?",
    answer:
      "All feedback is available in your dashboard, where you can view comprehensive analytics, trends, and insights. The dashboard provides visual representations of your feedback data, making it easy to identify patterns and areas for improvement.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 bg-[#0A0A0A] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-lg">
            Find answers to common questions about InvisiFeed
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 rounded-lg px-4"
              >
                <AccordionTrigger className="text-yellow-400 hover:text-yellow-300 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;

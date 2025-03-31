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
    question: "How does anonymous feedback work?",
    answer:
      "Our platform ensures complete anonymity by removing all identifying information from feedback submissions. Users can freely share their thoughts without fear of repercussions, while organizations receive valuable insights to improve their services.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take security seriously. We use enterprise-grade encryption and follow best practices for data protection. Your data is stored securely and never shared with third parties without your explicit consent.",
  },
  {
    question: "Can I customize the feedback forms?",
    answer:
      "Absolutely! You can create custom feedback forms with specific questions, rating scales, and categories that match your organization's needs. The platform is fully customizable to suit your requirements.",
  },
  {
    question: "How do I get started?",
    answer:
      "Getting started is easy! Simply register your organization, create your first feedback form, and share it with your customers. Our intuitive dashboard will help you track and analyze responses in real-time.",
  },
  {
    question: "What kind of analytics do you provide?",
    answer:
      "We provide comprehensive analytics including response rates, sentiment analysis, trend tracking, and detailed reports. You can visualize your data through interactive charts and export reports for further analysis.",
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
            Find answers to common questions about our platform
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

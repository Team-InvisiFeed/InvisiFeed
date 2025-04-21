"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Lightbulb,
  Target,
  ArrowRight,
  Shield,
  Zap,
  BarChart,
  Users,
  CheckCircle,
  Sparkles,
  Rocket,
  Brain,
  Heart,
  Clock,
  Star,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gift,
  ClipboardCheck,
  Building2,
  FileCheck,
  UserCog,
  Database,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

// Research Data
const feedbackResearch = [
  {
    title: "Businesses Seeking Feedback",
    subheading: "Percentage of Businesses Seeking Feedback",
    value: "92%",
    source: "Harvard Business Review, 2023",
    icon: Users,
  },
  {
    title: "Feedback Response Rate",
    subheading: "Feedbacks received per 100 Customers",
    value: "15%",
    source: "McKinsey & Company, 2023",
    icon: BarChart,
  },
  {
    title: "Revenue Impact",
    subheading: "Impact of Customer Feedbacks on Revenue",
    value: "25%",
    source: "Forrester Research, 2023",
    icon: Star,
  },
];

// Feature Comparison
const featureComparison = [
  {
    feature: "Anonymous Feedback",
    invisifeed: true,
    traditional: false,
  },
  {
    feature: "Automated Collection",
    invisifeed: true,
    traditional: false,
  },
  {
    feature: "AI-Powered Insights",
    invisifeed: true,
    traditional: false,
  },
  {
    feature: "Real-time Analytics",
    invisifeed: true,
    traditional: false,
  },
  {
    feature: "No Client Effort",
    invisifeed: true,
    traditional: false,
  },
];

// Success Metrics
// const successMetrics = [
//   {
//     metric: "Feedback Collection Rate",
//     value: 85,
//     industryAvg: 15,
//     unit: "%",
//   },
//   {
//     metric: "Response Time",
//     value: 24,
//     industryAvg: 72,
//     unit: "hours",
//   },
//   {
//     metric: "Client Satisfaction",
//     value: 4.7,
//     industryAvg: 3.8,
//     unit: "/5",
//   },
// ];

// Testimonials
// const testimonials = [
//   {
//     quote: "InvisiFeed transformed how we collect feedback. The anonymous nature means we get honest insights we never got before.",
//     author: "Sarah Johnson",
//     role: "CEO, Design Agency",
//   },
//   {
//     quote: "The AI-powered insights have helped us identify areas for improvement we never would have noticed otherwise.",
//     author: "Michael Chen",
//     role: "Founder, Tech Startup",
//   },
//   {
//     quote: "Our client retention has improved by 40% since implementing InvisiFeed. The feedback loop is invaluable.",
//     author: "Emma Rodriguez",
//     role: "Marketing Director",
//   },
// ];

// Features
const features = [
  {
    title: "Smart Invoice Integration",
    description:
      "Upload existing invoices or create new ones directly on our platform. Add feedback forms and coupons seamlessly.",
    icon: FileText,
  },
  {
    title: "Anonymous Feedback Collection",
    description:
      "Customers provide honest feedback anonymously, ensuring genuine insights without any personal data collection.",
    icon: Shield,
  },
  {
    title: "Coupon Management",
    description:
      "Create, manage, and track coupons. Customers reveal coupons only after submitting feedback.",
    icon: Gift,
  },
  {
    title: "Comprehensive Feedback Form",
    description:
      "Detailed ratings for satisfaction, communication, service quality, value, and recommendations.",
    icon: ClipboardCheck,
  },
  {
    title: "Advanced Analytics Dashboard",
    description:
      "Visualize feedback-to-invoice ratios, sentiment analysis, and service ratings through interactive charts.",
    icon: BarChart,
  },
  {
    title: "AI-Powered Insights",
    description:
      "Get automated analysis of improvement areas and excellence points from customer feedback.",
    icon: Brain,
  },
  {
    title: "GSTIN Integration",
    description:
      "Seamlessly integrate GSTIN details for professional invoice generation.",
    icon: Building2,
  },
  {
    title: "Sample Invoices",
    description:
      "Test the platform with pre-loaded sample invoices to experience the full workflow.",
    icon: FileCheck,
  },
  {
    title: "Profile Management",
    description:
      "Update business details and manage account settings with ease.",
    icon: UserCog,
  },
  {
    title: "Data Management",
    description:
      "Full control over your data with options to reset or manage feedback history.",
    icon: Database,
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const WhyInvisiFeedSection = () => {


  const [isNavigatingToRegister, setIsNavigatingToRegister] = useState(false);
  const router = useRouter();
  return (
    <div className="min-h-screen  bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-2 p-5 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              More Than Just Invoices, We Deliver Insights
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              This is the Story of InvisiFeed
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                className={`bg-gradient-to-r ${
                  isNavigatingToRegister
                    ? "opacity-50 disabled"
                    : "cursor-pointer"
                }  from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-105`}
                onClick={() => {
                  setIsNavigatingToRegister(true);
                  router.push("/register");
                }}
              >
                {isNavigatingToRegister ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...{" "}
                  </>
                ) : (
                  <>
                    Try InvisiFeed for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/50 cursor-pointer  rounded-xl transition-all duration-300"
                onClick={() => {
                  window.scrollTo({
                    top: document.getElementById("features").offsetTop,
                    behavior: "smooth",
                  });
                }}
              >
                See Our Features
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Research Data Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              The Power of Anonymous Feedback
            </h2>
            <p className="text-xl text-gray-300">
              Research shows the critical importance of feedback in business
              growth
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            {feedbackResearch.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative overflow-hidden"
              >
                <Card className="flex flex-col w-full bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/70 backdrop-blur-md text-white max-w-7xl shadow-2xl rounded-2xl border border-yellow-400/20 p-8 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                      <stat.icon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <CardTitle className="text-xl text-yellow-500">
                      {stat.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      {stat.subheading}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-yellow-500 mb-2">
                      {stat.value}
                    </div>
                    <p className="text-gray-400 text-sm">{stat.source}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Analytics Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <Card className="bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/70 backdrop-blur-md text-white max-w-7xl shadow-2xl rounded-2xl border border-yellow-400/20  group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader>
                <CardTitle className="text-yellow-500">
                  Feedback Impact on Business Growth
                </CardTitle>
                <CardDescription>
                  Data from 1000+ businesses using anonymous feedback systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={[
                        { name: "2021", feedback: 20, growth: 15 },
                        { name: "2022", feedback: 40, growth: 25 },
                        { name: "2023", feedback: 60, growth: 40 },
                        { name: "2024", feedback: 80, growth: 65 },
                      ]}
                      margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis
                        dataKey="name"
                        stroke="#666"
                        tick={{ fill: "#999" }}
                      />
                      <YAxis stroke="#666" tick={{ fill: "#999" }} />
                      <ChartTooltip
                        contentStyle={{
                          fontSize: "10px",
                          backgroundColor: "#0A0A0A",
                          border: "1px solid #2A2A2A",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <ChartLegend />
                      <Line
                        type="monotone"
                        dataKey="feedback"
                        name="Feedback Collection"
                        stroke="#EAB308"
                        strokeWidth={2}
                        dot={{ fill: "#EAB308", strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="growth"
                        name="Business Growth"
                        stroke="#22C55E"
                        strokeWidth={2}
                        dot={{ fill: "#22C55E", strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              Were You Also Tired of the Feedback Guessing Game?
            </h2>
            <p className="text-xl text-gray-300">
              We've seen it – millions of freelancers, agencies, consultants,
              and service providers like you work with incredible dedication and
              effort for their clients.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: MessageSquare,
                title: "The Communication Gap",
                description:
                  "Asking for direct feedback can be awkward, and clients often hesitate to share their true thoughts.",
              },
              {
                icon: Lightbulb,
                title: "Left in the Dark ?",
                description:
                  "Without honest feedback, you're constantly guessing how to improve your service.",
              },
              {
                icon: Target,
                title: "Untapped Potential",
                description:
                  "Many talented professionals aren't reaching their true potential due to lack of valuable feedback.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative overflow-hidden"
              >
                <Card className="flex flex-col w-full h-full bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/70 backdrop-blur-md text-white max-w-7xl shadow-2xl rounded-2xl border border-yellow-400/20 p-8 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <CardTitle className="text-xl text-yellow-500">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              How We Compare
            </h2>
            <p className="text-xl text-gray-300">
              See how InvisiFeed stands out from traditional feedback methods
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/70 backdrop-blur-md text-white max-w-7xl shadow-2xl rounded-2xl border border-yellow-400/20 p-8 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Feature</TableHead>
                    <TableHead className="text-center text-yellow-500">
                      InvisiFeed
                    </TableHead>
                    <TableHead className="text-center text-gray-400">
                      Traditional Methods
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureComparison.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className="text-white">
                        {row.feature}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.invisifeed ? (
                          <CheckCircle className="w-5 h-5 text-yellow-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.traditional ? (
                          <CheckCircle className="w-5 h-5 text-gray-400 mx-auto" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Carousel */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              Powerful Features for Your Business
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to collect, analyze, and act on customer
              feedback
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Carousel className="w-full mx-auto relative overflow-hidden">
              <CarouselContent>
                {features.map((feature, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="h-full bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/70 backdrop-blur-md text-white max-w-7xl shadow-2xl rounded-2xl border border-yellow-400/20 p-8 group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />
                      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full">
                          <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                            <feature.icon className="w-6 h-6 text-yellow-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-yellow-500 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-300 flex-grow">
                            {feature.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="bg-[#0A0A0A] border-yellow-400/20 text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition-all duration-300" />
              <CarouselNext className="bg-[#0A0A0A] border-yellow-400/20 text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition-all duration-300" />
              <CarouselDots />
            </Carousel>
              
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              Take the First Step Towards Growth
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              We're not just a software company; we're your growth partners.
              Join us and see how transparent, honest feedback can take your
              business to the next level.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className={`bg-gradient-to-r ${
                  isNavigatingToRegister
                    ? "opacity-50 disabled"
                    : "cursor-pointer"
                }  from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-105`}
                onClick={() => {
                  setIsNavigatingToRegister(true);
                  router.push("/register");
                }}
              >
                {isNavigatingToRegister ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...{" "}
                  </>
                ) : (
                  <>
                    Try InvisiFeed for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WhyInvisiFeedSection;

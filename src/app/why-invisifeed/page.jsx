"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  BarChart,
  FileText,
  Star,
  MessageSquare,
  TrendingUp,
  Zap,
  ArrowRight,
  Users,
  Clock,
  ChartBar,
  Lightbulb,
  Award,
  CheckCircle,
  Percent,
  DollarSign,
  LineChart,
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

// Industry Statistics
const industryStats = [
  {
    title: "Businesses Seeking Feedback",
    value: "92%",
    source: "Harvard Business Review, 2023",
    icon: Users,
  },
  {
    title: "Feedback Response Rate",
    value: "15%",
    source: "McKinsey & Company, 2023",
    icon: Percent,
  },
  {
    title: "Revenue Impact",
    value: "25%",
    source: "Forrester Research, 2023",
    icon: DollarSign,
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
const successMetrics = [
  {
    metric: "Feedback Collection Rate",
    value: 85,
    industryAvg: 15,
    unit: "%",
  },
  {
    metric: "Response Time",
    value: 24,
    industryAvg: 72,
    unit: "hours",
  },
  {
    metric: "Client Satisfaction",
    value: 4.7,
    industryAvg: 3.8,
    unit: "/5",
  },
];

const WhyInvisiFeedSection = () => {
  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600"
          >
            Why Choose InvisiFeed?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Transform your business with anonymous, actionable feedback. 
            Turn every invoice into an opportunity for growth.
          </motion.p>
        </div>

        {/* Industry Problem Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">The Feedback Challenge</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industryStats.map((stat, index) => (
              <Card key={stat.title} className="bg-[#1A1A1A] border-[#2A2A2A]">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                    <stat.icon className="w-6 h-6 text-yellow-500" />
                  </div>
                  <CardTitle className="text-xl text-white">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-yellow-500 mb-2">{stat.value}</div>
                  <p className="text-gray-400 text-sm">{stat.source}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Feature Comparison Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How We Compare</h2>
          <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Feature</TableHead>
                  <TableHead className="text-center text-yellow-500">InvisiFeed</TableHead>
                  <TableHead className="text-center text-gray-400">Traditional Methods</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureComparison.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="text-white">{row.feature}</TableCell>
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

        {/* Success Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Proven Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successMetrics.map((metric) => (
              <Card key={metric.metric} className="bg-[#1A1A1A] border-[#2A2A2A]">
                <CardHeader>
                  <CardTitle className="text-xl text-white">{metric.metric}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-yellow-500">{metric.value}</span>
                    <span className="text-gray-400">{metric.unit}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Industry Average</span>
                      <span className="text-gray-400">{metric.industryAvg}{metric.unit}</span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.industryAvg) * 100} 
                      className="h-2 bg-gray-700"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <Button 
            size="lg" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            Start Collecting Feedback Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyInvisiFeedSection; 
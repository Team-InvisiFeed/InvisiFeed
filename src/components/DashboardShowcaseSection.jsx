"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  Star, 
  ThumbsUp, 
  ThumbsDown 
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  LineChart as RechartsLineChart,
  Bar,
  Pie,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import {ChartContainer} from "@/components/ui/chart";

const DashboardShowcaseSection = () => {
  // Mock data for charts
  const feedbackPer100Data = [
    { name: "Jan", value: 45 },
    { name: "Feb", value: 52 },
    { name: "Mar", value: 48 },
    { name: "Apr", value: 61 },
    { name: "May", value: 55 },
    { name: "Jun", value: 67 },
  ];

  const positiveFeedbackData = [
    { name: "Positive", value: 78 },
    { name: "Negative", value: 22 },
  ];

  const ratingBreakdownData = [
    { name: "5★", value: 45 },
    { name: "4★", value: 25 },
    { name: "3★", value: 15 },
    { name: "2★", value: 10 },
    { name: "1★", value: 5 },
  ];

  const ratingTrendData = [
    { name: "Jan", value: 4.2 },
    { name: "Feb", value: 4.3 },
    { name: "Mar", value: 4.1 },
    { name: "Apr", value: 4.4 },
    { name: "May", value: 4.5 },
    { name: "Jun", value: 4.7 },
  ];

  const COLORS = ["#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309"];

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
            Powerful Dashboard Insights
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Visualize your feedback data with comprehensive analytics and AI-powered insights
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Metrics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Feedback per 100 invoices */}
            <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-400 font-medium">Feedback per 100 invoices</h3>
                <BarChart className="w-5 h-5 text-yellow-400" />
              </div>
              <ChartContainer className="h-64">
                <RechartsBarChart data={feedbackPer100Data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0A0A0A", 
                      border: "1px solid rgba(251, 191, 36, 0.2)",
                      borderRadius: "0.5rem"
                    }} 
                  />
                  <Bar dataKey="value" fill="#FCD34D" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ChartContainer>
            </div>

            {/* Positive Feedback % */}
            <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-400 font-medium">Positive Feedback %</h3>
                <PieChart className="w-5 h-5 text-yellow-400" />
              </div>
              <ChartContainer className="h-64">
                <RechartsPieChart>
                  <Pie
                    data={positiveFeedbackData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {positiveFeedbackData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#FCD34D" : index === 1 ? "#9CA3AF" : "#EF4444"} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#FFFFFF", 

                      border: "1px solid rgba(251, 191, 36, 0.2)",
                      borderRadius: "0.5rem"
                    }} 
                  />
                  <Legend />
                </RechartsPieChart>
              </ChartContainer>
            </div>

            {/* Average Rating */}
            <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-400 font-medium">Average Rating</h3>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex items-center justify-center h-32">
                <div className="text-5xl font-bold text-white">4.7</div>
                <div className="ml-4 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-6 h-6 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Charts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* 5-Rating Breakdown */}
            <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-400 font-medium">5-Rating Breakdown</h3>
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <ChartContainer className="h-64">
                <RechartsBarChart data={ratingBreakdownData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0A0A0A", 
                      border: "1px solid rgba(251, 191, 36, 0.2)",
                      borderRadius: "0.5rem"
                    }} 
                  />
                  <Bar dataKey="value" fill="#FCD34D" radius={[0, 4, 4, 0]} />
                </RechartsBarChart>
              </ChartContainer>
            </div>

            {/* Rating Trend Over Time */}
            <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-400 font-medium">Rating Trend Over Time</h3>
                <LineChart className="w-5 h-5 text-yellow-400" />
              </div>
              <ChartContainer className="h-64">
                <RechartsLineChart data={ratingTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" domain={[3.5, 5]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0A0A0A", 
                      border: "1px solid rgba(251, 191, 36, 0.2)",
                      borderRadius: "0.5rem"
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FCD34D" 
                    strokeWidth={2} 
                    dot={{ fill: "#FCD34D", r: 4 }} 
                    activeDot={{ r: 6, fill: "#F59E0B" }} 
                  />
                </RechartsLineChart>
              </ChartContainer>
            </div>

            {/* AI-Powered Insights */}
            <div className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-400 font-medium">AI-Powered Insights</h3>
                <div className="flex space-x-2">
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Best Performing Area</h4>
                  <p className="text-gray-300 text-sm">Customer service responsiveness</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2">Area to Improve</h4>
                  <p className="text-gray-300 text-sm">Delivery time consistency</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DashboardShowcaseSection; 
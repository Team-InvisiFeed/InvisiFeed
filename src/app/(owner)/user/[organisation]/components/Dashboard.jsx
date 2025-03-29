"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Activity, FileText, Users, Settings, TrendingUp, TrendingDown, Lightbulb, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Label, Pie, PieChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  feedbackRatio: {
    label: "Feedback Ratio",
    color: "#EAB308",
  },
  remaining: {
    label: "Remaining",
    color: "#1F2937",
  },
  positive: {
    label: "Positive",
    color: "#22C55E",
  },
  negative: {
    label: "Negative",
    color: "#EF4444",
  },
  ratings: {
    label: "Rating",
    color: "#FACC15",
  },
};

const Dashboard = () => {
  const { data: session } = useSession();
  const owner = session?.user;
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.post("/api/get-dashboard-metrics", {
          username: owner.username,
        });
        setMetrics(response.data.data);
      } catch (error) {
        setError("Failed to fetch dashboard metrics");
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (owner?.username) {
      fetchMetrics();
    }
  }, [owner]);

  const feedbackRatioData = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        name: "Feedback Ratio",
        value: metrics.feedbackRatio,
        fill: "#EAB308",
      },
      {
        name: "Remaining",
        value: 100 - metrics.feedbackRatio,
        fill: "#1F2937",
      },
    ];
  }, [metrics]);

  const positiveNegativeData = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        name: "Positive",
        value: (metrics.positiveNegativeRatio / (1 + metrics.positiveNegativeRatio)) * 100,
        fill: "#22C55E",
      },
      {
        name: "Negative",
        value: (1 / (1 + metrics.positiveNegativeRatio)) * 100,
        fill: "#EF4444",
      },
    ];
  }, [metrics]);

  const ratingData = useMemo(() => {
    if (!metrics) return [];
    return Object.entries(metrics.averageRatings)
      .filter(([key]) => key !== "overAllRating")
      .map(([key, value]) => ({
        name: key.replace("Rating", ""),
        value: value,
        fill: "#FACC15",
      }));
  }, [metrics]);

  const performanceData = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        name: metrics.bestPerforming.metric,
        value: metrics.bestPerforming.rating,
        fill: "#22C55E",
      },
      {
        name: metrics.worstPerforming.metric,
        value: metrics.worstPerforming.rating,
        fill: "#EF4444",
      },
    ];
  }, [metrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-yellow-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Comprehensive overview of your service performance and customer feedback
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/10 hover:border-yellow-400/30 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Feedback Ratio</p>
                <h3 className="text-2xl font-bold text-white mt-1">{metrics.feedbackRatio}%</h3>
                <p className="text-gray-500 text-sm mt-1">Feedbacks per 100 invoices</p>
              </div>
              <div className="p-3 bg-[#0A0A0A]/50 rounded-lg group-hover:bg-yellow-400/10 transition-colors">
                <FileText className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/10 hover:border-yellow-400/30 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Rating</p>
                <h3 className="text-2xl font-bold text-white mt-1">{metrics.averageOverallRating.toFixed(1)}</h3>
                <p className="text-gray-500 text-sm mt-1">Overall satisfaction</p>
              </div>
              <div className="p-3 bg-[#0A0A0A]/50 rounded-lg group-hover:bg-yellow-400/10 transition-colors">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/10 hover:border-yellow-400/30 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Feedbacks</p>
                <h3 className="text-2xl font-bold text-white mt-1">{metrics.totalFeedbacks}</h3>
                <p className="text-gray-500 text-sm mt-1">Total received</p>
              </div>
              <div className="p-3 bg-[#0A0A0A]/50 rounded-lg group-hover:bg-yellow-400/10 transition-colors">
                <Users className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/10 hover:border-yellow-400/30 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Positive/Negative</p>
                <h3 className="text-2xl font-bold text-white mt-1">{metrics.positiveNegativeRatio.toFixed(1)}</h3>
                <p className="text-gray-500 text-sm mt-1">Feedback ratio</p>
              </div>
              <div className="p-3 bg-[#0A0A0A]/50 rounded-lg group-hover:bg-yellow-400/10 transition-colors">
                <Activity className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Feedback Ratio Chart */}
          <Card className="bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-yellow-400 text-lg">Feedback Ratio</CardTitle>
              <CardDescription className="text-sm">Percentage of invoices with feedback</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[200px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={feedbackRatioData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={60}
                    strokeWidth={4}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {metrics.feedbackRatio}%
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Feedback Rate
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Positive/Negative Ratio Chart */}
          <Card className="bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-yellow-400 text-lg">Feedback Sentiment</CardTitle>
              <CardDescription className="text-sm">Positive vs Negative Feedback Ratio</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[200px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={positiveNegativeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={60}
                    strokeWidth={4}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {metrics.positiveNegativeRatio.toFixed(1)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Pos/Neg Ratio
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Ratings and Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Service Ratings */}
          <Card className="bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-yellow-400 text-lg">Service Ratings</CardTitle>
              <CardDescription className="text-sm">Average ratings across different aspects</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <div className="h-[250px]">
                <ChartContainer
                  config={chartConfig}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" domain={[0, 5]} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <Bar dataKey="value" fill="#FACC15" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-yellow-400 text-lg">Performance Metrics</CardTitle>
              <CardDescription className="text-sm">Best and Worst Performing Areas</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <div className="h-[250px]">
                <ChartContainer
                  config={chartConfig}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" domain={[0, 5]} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <Bar dataKey="value" fill="#22C55E" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Improvements */}
          <Card className="bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-yellow-400">Areas for Improvement</CardTitle>
              </div>
              <CardDescription>AI-generated insights for better performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {metrics.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-400">•</span>
                    <span className="text-gray-300">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card className="bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-yellow-400">Key Strengths</CardTitle>
              </div>
              <CardDescription>AI-identified areas of excellence</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {metrics.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-400">•</span>
                    <span className="text-gray-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

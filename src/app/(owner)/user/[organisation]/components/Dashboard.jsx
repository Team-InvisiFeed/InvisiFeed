"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Activity, FileText, Users, Settings } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { title: "Total Invoices", value: "24", icon: FileText },
    { title: "Active Users", value: "156", icon: Users },
    { title: "Recent Activity", value: "12", icon: Activity },
    { title: "Settings", value: "Updated", icon: Settings },
  ];

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
            Manage your activities efficiently and stay organized!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/10 hover:border-yellow-400/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                  </div>
                  <div className="p-3 bg-[#0A0A0A]/50 rounded-lg group-hover:bg-yellow-400/10 transition-colors">
                    <Icon className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-xl border border-yellow-400/10 p-6"
        >
          <div className="flex items-center space-x-2 mb-6">
            <LayoutDashboard className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Overview</h2>
          </div>
          
          {/* Placeholder for future content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-lg p-6 border border-yellow-400/10">
              <h3 className="text-lg font-medium text-yellow-400 mb-4">Recent Activity</h3>
              <p className="text-gray-400">Your recent activities will appear here.</p>
            </div>
            
            <div className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-lg p-6 border border-yellow-400/10">
              <h3 className="text-lg font-medium text-yellow-400 mb-4">Quick Actions</h3>
              <p className="text-gray-400">Common actions will be available here.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

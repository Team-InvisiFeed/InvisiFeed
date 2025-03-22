"use client";

import React from "react";

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center h-[80vh] w-[95%] max-w-5xl bg-white text-gray-800 shadow-md rounded-lg border border-gray-200 p-8">
        <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
        <p className="text-base text-gray-600 text-center">
          Manage your activities efficiently and stay organized!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

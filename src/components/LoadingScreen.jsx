"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="flex items-center space-x-2 text-yellow-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
} 
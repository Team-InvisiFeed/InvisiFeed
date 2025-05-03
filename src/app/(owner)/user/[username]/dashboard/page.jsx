import Dashboard from "@/components/owner-page-components/Dashboard";
import UserRatingsGraph from "@/components/owner-page-components/UserRatingsGraph";
import ScrollToTop from "@/components/ScrollToTop";
import React from "react";

function page() {
  return (
    <>
      <Dashboard />
      <UserRatingsGraph />
      <ScrollToTop />
    </>
  );
}

export default page;

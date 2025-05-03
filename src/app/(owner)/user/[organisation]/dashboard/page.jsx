import Dashboard from "@/components/owner-page-components/Dashboard";
import UserRatingsGraph from "@/components/owner-page-components/UserRatingsGraph";
import React from "react";

function page() {
  return (
    <>
      <Dashboard />
      <UserRatingsGraph />
    </>
  );
}

export default page;

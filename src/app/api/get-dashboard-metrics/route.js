import dbConnect from "@/lib/dbConnect";
import FeedbackModel from "@/models/Feedback";
import InvoiceModel from "@/models/Invoice";
import OwnerModel from "@/models/Owner";
import { NextResponse } from "next/server";

// Constants
const METRICS = {
  satisfactionRating: "Satisfaction",
  communicationRating: "Communication",
  qualityOfServiceRating: "Quality of Service",
  valueForMoneyRating: "Value for Money",
  recommendRating: "Recommendation",
  overAllRating: "Overall Rating",
};

// Helper functions
const calculateAverageRatings = (feedbacks, totalFeedbacks) => {
  if (!totalFeedbacks)
    return Object.fromEntries(Object.keys(METRICS).map((key) => [key, 0]));

  return Object.fromEntries(
    Object.keys(METRICS).map((key) => [
      key,
      Number(
        (
          feedbacks.reduce((sum, feedback) => sum + (feedback[key] || 0), 0) /
          totalFeedbacks
        ).toFixed(2)
      ),
    ])
  );
};

const getPerformanceMetrics = (averageRatings) => {
  const metricsArray = Object.entries(averageRatings)
    .filter(([key]) => key !== "overAllRating")
    .sort(([, a], [, b]) => b - a);

  return {
    best: {
      metric: METRICS[metricsArray[0][0]],
      rating: metricsArray[0][1],
    },
    worst: {
      metric: METRICS[metricsArray[metricsArray.length - 1][0]],
      rating: metricsArray[metricsArray.length - 1][1],
    },
  };
};

// Helper function to get current month feedbacks
function getCurrentMonthFeedbacks(feedbacks) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return feedbacks.filter((feedback) => {
    const feedbackDate = new Date(feedback.createdAt);
    return (
      feedbackDate.getMonth() === currentMonth &&
      feedbackDate.getFullYear() === currentYear
    );
  });
}

// Helper function to group feedbacks by date for current month
function groupByDate(feedbacks) {
  const grouped = {};
  const currentDate = new Date();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  // Initialize all days with zero ratings
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateKey = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    grouped[dateKey] = {
      date: dateKey,
      rating: 0,
      count: 0,
    };
  }

  // Add actual feedback data
  feedbacks.forEach((feedback) => {
    const feedbackDate = new Date(feedback.createdAt);
    const dateKey = feedbackDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });

    if (grouped[dateKey]) {
      grouped[dateKey].rating += feedback.overAllRating;
      grouped[dateKey].count += 1;
    }
  });

  // Calculate averages and sort by date
  const sortedData = Object.values(grouped)
    .map((day) => ({
      ...day,
      rating: day.count > 0 ? Number((day.rating / day.count).toFixed(2)) : 0,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

  // If we have more than 6 points, group them into 6 intervals
  if (sortedData.length > 6) {
    const interval = Math.ceil(sortedData.length / 6);
    const groupedData = [];

    for (let i = 0; i < sortedData.length; i += interval) {
      const chunk = sortedData.slice(i, i + interval);
      const averageRating =
        chunk.reduce((sum, day) => sum + day.rating, 0) / chunk.length;
      const totalCount = chunk.reduce((sum, day) => sum + day.count, 0);

      groupedData.push({
        date: `${chunk[0].date} - ${chunk[chunk.length - 1].date}`,
        rating: Number(averageRating.toFixed(2)),
        count: totalCount,
      });
    }

    return groupedData;
  }

  return sortedData;
}

// Helper function to get current week feedbacks
function getCurrentWeekFeedbacks(feedbacks) {
  const currentDate = new Date();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return feedbacks.filter((feedback) => {
    const feedbackDate = new Date(feedback.createdAt);
    return feedbackDate >= startOfWeek && feedbackDate <= endOfWeek;
  });
}

// Helper function to get current year feedbacks
function getCurrentYearFeedbacks(feedbacks) {
  const currentYear = new Date().getFullYear();
  return feedbacks.filter((feedback) => {
    const feedbackYear = new Date(feedback.createdAt).getFullYear();
    return feedbackYear === currentYear;
  });
}

// Helper function to group feedbacks by day
function groupByDay(feedbacks) {
  const grouped = {};
  feedbacks.forEach((feedback) => {
    const date = new Date(feedback.createdAt);
    const dayKey = date.toLocaleDateString("en-US", {
      weekday: "short",
    });

    if (!grouped[dayKey]) {
      grouped[dayKey] = {
        date: dayKey,
        rating: 0,
        count: 0,
      };
    }
    grouped[dayKey].rating += feedback.overAllRating;
    grouped[dayKey].count += 1;
  });

  // Sort days in chronological order
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Object.values(grouped)
    .map((day) => ({
      ...day,
      rating: Number((day.rating / day.count).toFixed(2)),
    }))
    .sort((a, b) => dayOrder.indexOf(a.date) - dayOrder.indexOf(b.date));
}

// Helper function to group feedbacks by month
function groupByMonth(feedbacks) {
  const grouped = {};
  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Initialize all months with zero ratings
  monthOrder.forEach((month) => {
    grouped[month] = {
      date: month,
      rating: 0,
      count: 0,
    };
  });

  // Add actual feedback data
  feedbacks.forEach((feedback) => {
    const date = new Date(feedback.createdAt);
    const monthKey = date.toLocaleDateString("en-US", {
      month: "short",
    });

    if (grouped[monthKey]) {
      grouped[monthKey].rating += feedback.overAllRating;
      grouped[monthKey].count += 1;
    }
  });

  // Calculate averages and sort
  return Object.values(grouped)
    .map((month) => ({
      ...month,
      rating:
        month.count > 0 ? Number((month.rating / month.count).toFixed(2)) : 0,
    }))
    .sort((a, b) => monthOrder.indexOf(a.date) - monthOrder.indexOf(b.date));
}

export async function POST(req) {
  try {
    await dbConnect();

    // Input validation
    const body = await req.json();
    if (!body?.username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    const decodedUsername = decodeURIComponent(body.username);
    const { year, viewType = "currentYear" } = body;

    // Optimize database query
    const owner = await OwnerModel.findOne({ username: decodedUsername });

    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Business not found" },
        { status: 404 }
      );
    }

    const feedbacks = await FeedbackModel.find({ givenTo: owner._id });
    const invoices = await InvoiceModel.find({ owner: owner._id });
    const totalFeedbacks = feedbacks.length;
    const totalInvoices = invoices.length;

    // Calculate metrics
    const feedbackRatio = Number(
      ((totalFeedbacks / totalInvoices) * 100 || 0).toFixed(2)
    );
    const averageRatings = calculateAverageRatings(feedbacks, totalFeedbacks);
    const { best: bestPerforming, worst: worstPerforming } =
      getPerformanceMetrics(averageRatings);

    // Calculate feedback sentiment
    const positiveFeedbacks = feedbacks.filter(
      (f) => f.overAllRating > 2.5
    ).length;
    const negativeFeedbacks = totalFeedbacks - positiveFeedbacks;
    const positivePercentage = Number(
      ((positiveFeedbacks / totalFeedbacks) * 100 || 0).toFixed(2)
    );
    const negativePercentage = Number(
      ((negativeFeedbacks / totalFeedbacks) * 100 || 0).toFixed(2)
    );

    // Get historical data based on view type
    let historicalRatings = [];
    let filteredFeedbacks = [...feedbacks];

    // Handle historical year data
    if (year) {
      filteredFeedbacks = feedbacks.filter((feedback) => {
        const feedbackYear = new Date(feedback.createdAt).getFullYear();
        return feedbackYear === parseInt(year);
      });
      historicalRatings = groupByMonth(filteredFeedbacks);
    } else if (viewType) {
      // Handle current time period data
      switch (viewType) {
        case "currentMonth":
          filteredFeedbacks = getCurrentMonthFeedbacks(feedbacks);
          historicalRatings = groupByDate(filteredFeedbacks);
          break;
        case "currentWeek":
          filteredFeedbacks = getCurrentWeekFeedbacks(feedbacks);
          historicalRatings = groupByDay(filteredFeedbacks);
          break;
        case "currentYear":
          filteredFeedbacks = getCurrentYearFeedbacks(feedbacks);
          historicalRatings = groupByMonth(filteredFeedbacks);
          break;
        default:
          // Default to current year if no view type selected
          filteredFeedbacks = getCurrentYearFeedbacks(feedbacks);
          historicalRatings = groupByMonth(filteredFeedbacks);
      }
    } else {
      // If neither year nor view type is selected, default to current year
      filteredFeedbacks = getCurrentYearFeedbacks(feedbacks);
      historicalRatings = groupByMonth(filteredFeedbacks);
    }

    // Get available years for the dropdown
    const availableYears = [
      ...new Set(
        feedbacks.map((feedback) => new Date(feedback.createdAt).getFullYear())
      ),
    ].sort((a, b) => b - a);

    return NextResponse.json(
      {
        success: true,
        message: "Dashboard metrics retrieved successfully",
        data: {
          feedbackRatio,
          averageOverallRating: averageRatings.overAllRating,
          totalFeedbacks,
          totalInvoices,
          apiMetrics: METRICS,
          bestPerforming,
          worstPerforming,
          improvements: owner.currentRecommendedActions?.improvements || [],
          strengths: owner.currentRecommendedActions?.strengths || [],
          positivePercentage,
          positiveFeedbacks,
          negativeFeedbacks,
          averageRatings,
          negativePercentage,
          historicalRatings,
          availableYears,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    return NextResponse.json(
      {
        message: error.message || "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

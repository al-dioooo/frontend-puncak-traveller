"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReactECharts from "echarts-for-react";
import {
  IconCalendarEvent,
  IconTicket,
  IconTag,
  IconCoin,
  IconTrendingUp,
  IconPlus,
  IconChevronRight,
  IconMail,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { cn } from "@/lib/cn";
import { readStoredAuth } from "@/lib/client-auth";

// Fallback statistics matches references
const fallbackStats = {
  eventsCount: 24,
  upcomingEvents: 14,
  bookingsCount: 1284,
  ticketsSold: 8640,
  revenue: "Rp 248M",
};

// Recent bookings matching references
const recentBookings = [
  {
    reference: "PTR-26-8F3K2A",
    member: {
      name: "Alex Puncak",
      avatar: "",
    },
    event: "Puncak Trail Run 2026",
    total: "Rp 290K",
    status: "Paid",
  },
  {
    reference: "PHC-26-2M9X1B",
    member: {
      name: "Maya Sari",
      avatar: "",
    },
    event: "Highland Camp & Bonfire",
    total: "Rp 320K",
    status: "Paid",
  },
  {
    reference: "PFR-26-7K2P0Q",
    member: {
      name: "Budi Hartono",
      avatar: "",
    },
    event: "Forest Fun Run 10K",
    total: "Rp 360K",
    status: "Pending",
  },
  {
    reference: "PYG-26-5T8L3C",
    member: {
      name: "Indah Permata",
      avatar: "",
    },
    event: "Mindful Mountain Yoga",
    total: "Rp 190K",
    status: "Paid",
  },
  {
    reference: "PTR-26-9D4F7E",
    member: {
      name: "Rian Maulana",
      avatar: "",
    },
    event: "Puncak Trail Run 2026",
    total: "Rp 95K",
    status: "Cancelled",
  },
];

// Upcoming events visual list matching references
const upcomingEventsList = [
  {
    title: "Puncak Trail Run 2026",
    date: "14 Jun 2026",
    sold: 158,
    total: 200,
    percentage: 79,
    live: false,
  },
  {
    title: "Sunrise Healthy Walk",
    date: "22 Jun 2026",
    sold: 64,
    total: 150,
    percentage: 43,
    live: false,
  },
  {
    title: "Highland Camp & Bonfire",
    date: "4–6 Jul 2026",
    sold: 42,
    total: 60,
    percentage: 70,
    live: false,
  },
  {
    title: "Forest Fun Run 10K",
    date: "Today · live",
    sold: 200,
    total: 200,
    percentage: 100,
    live: true,
  },
];

// Inbox notifications feed matching references
const inboxMessages = [
  {
    sender: "Lina K.",
    subject: "Question about the 21K cut-off time…",
    time: "2h ago",
  },
  {
    sender: "Dimas P.",
    subject: "Can I transfer my camp ticket?",
    time: "5h ago",
  },
  {
    sender: "Putri A.",
    subject: "Partnership — trail nutrition brand",
    time: "1d ago",
  },
];

export default function AdminDashboardPage() {
  const [profile] = useState(() => readStoredAuth());
  const [stats, setStats] = useState(fallbackStats);

  useEffect(() => {
    async function loadStats() {
      try {
        // Load events, bookings, galleries count from API to merge with mock
        const [eventsRes, bookingsRes] = await Promise.all([
          fetch("/api/puncak/events", {
            headers: { Accept: "application/json" },
          }),
          fetch("/api/puncak/bookings", {
            headers: { Accept: "application/json" },
          }),
        ]);

        let apiEventsCount = fallbackStats.eventsCount;
        let apiBookingsCount = fallbackStats.bookingsCount;

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          if (Array.isArray(eventsData.data)) {
            apiEventsCount = eventsData.data.length;
          }
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          if (Array.isArray(bookingsData.data)) {
            apiBookingsCount = bookingsData.data.length;
          }
        }

        setStats({
          eventsCount: apiEventsCount,
          upcomingEvents: Math.max(14, apiEventsCount - 10),
          bookingsCount: apiBookingsCount,
          ticketsSold: Math.max(8640, apiBookingsCount * 6),
          revenue: apiBookingsCount > 10 ? `Rp ${(apiBookingsCount * 0.193).toFixed(1)}M` : fallbackStats.revenue,
        });
      } catch (err) {
        console.warn("Unable to load live admin statistics, utilizing ref data:", err);
      }
    }

    loadStats();
  }, []);

  // Apache ECharts styling options matching reference dashboard overview
  const chartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#0F172A",
      textStyle: { color: "#FFFFFF", fontSize: 12 },
      borderWidth: 0,
      padding: 10,
    },
    grid: {
      left: "0%",
      right: "0%",
      bottom: "0%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#647589", fontSize: 11, fontWeight: "500" },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#F1F5F9", width: 1 } },
      axisLabel: { color: "#647589", fontSize: 11, fontWeight: "500" },
    },
    series: [
      {
        name: "Bookings Volume",
        type: "bar",
        barWidth: "32%",
        data: [280, 420, 390, 610, 570, 780, 920, stats.bookingsCount],
        itemStyle: {
          color: "#F37820", // Puncak Orange
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#C24B00",
          },
        },
      },
    ],
  };

  const statCards = [
    {
      title: "Upcoming events",
      value: stats.upcomingEvents,
      change: "+3 this week",
      icon: IconCalendarEvent,
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      title: "Bookings · 30 days",
      value: stats.bookingsCount.toLocaleString(),
      change: "+12.5%",
      icon: IconTicket,
      iconColor: "text-orange-600 bg-orange-50",
    },
    {
      title: "Tickets sold",
      value: stats.ticketsSold.toLocaleString(),
      change: "+8.2%",
      icon: IconTag,
      iconColor: "text-teal-600 bg-teal-50",
    },
    {
      title: "Revenue · 30 days",
      value: stats.revenue,
      change: "+15.0%",
      icon: IconCoin,
      iconColor: "text-sky-600 bg-sky-50",
    },
  ];

  return (
    <AdminLayout activeTab="Dashboard" title="Dashboard">
      {/* Page Heading & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">
            Halo, {profile?.name?.split(" ")[0] || "Sari"} 👋
          </h1>
          <p className="text-[#647589] text-[14.5px] mt-1 font-medium">
            Here&apos;s what&apos;s happening across Puncak Travellers today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] px-4 py-2 rounded-full text-[13px] font-semibold text-[#0F172A] cursor-pointer shadow-sm hover:bg-slate-50 transition">
            <span>Last 30 days</span>
          </div>
          <Link
            href="/admin/events"
            className="flex items-center gap-2 bg-[#F37820] text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-sm shadow-orange-500/20 hover:bg-[#C24B00] transition motion-control"
          >
            <IconPlus className="w-4 h-4" />
            <span>New event</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200"
          >
            <div className="flex justify-between items-center">
              <span className={cn("p-2.5 rounded-xl", card.iconColor)}>
                <card.icon className="w-5 h-5" />
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                <IconTrendingUp className="w-3.5 h-3.5" />
                {card.change}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display leading-none">
                {card.value}
              </div>
              <div className="text-[13px] font-medium text-[#647589] mt-2">
                {card.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Span 2 Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[17px] font-bold text-[#0F172A] font-display">
                  Bookings volume
                </h3>
                <p className="text-[12px] text-[#647589] font-medium mt-0.5">
                  Last 8 weeks
                </p>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#0F172A]">
                <span className="w-2.5 h-2.5 bg-[#F37820] rounded-full" />
                <span>This year</span>
              </div>
            </div>
            <div className="h-[260px] w-full">
              <ReactECharts
                option={chartOptions}
                style={{ height: "100%", width: "100%" }}
                opts={{ renderer: "svg" }}
              />
            </div>
          </div>

          {/* Recent Bookings Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-[17px] font-bold text-[#0F172A] font-display">
                Recent bookings
              </h3>
              <Link
                href="/admin/bookings"
                className="flex items-center gap-1 text-[13px] font-bold text-[#F37820] hover:text-[#C24B00] transition"
              >
                <span>View all</span>
                <IconChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                      Reference
                    </th>
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                      Member
                    </th>
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                      Event
                    </th>
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                      Total
                    </th>
                    <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.reference}
                      className="hover:bg-[#F8F7F5] transition duration-150"
                    >
                      <td className="px-6 py-4 text-[13.5px] font-semibold text-[#0F172A] font-mono">
                        {booking.reference}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center font-bold text-xs text-[#F37820] uppercase">
                            {booking.member.name.slice(0, 2)}
                          </div>
                          <span className="text-[13.5px] font-bold text-[#0F172A]">
                            {booking.member.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13.5px] text-slate-700">
                        {booking.event}
                      </td>
                      <td className="px-6 py-4 text-[13.5px] font-bold text-[#0F172A]">
                        {booking.total}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                            booking.status === "Paid"
                              ? "bg-teal-50 text-teal-700"
                              : booking.status === "Pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          )}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Span 1 Column */}
        <div className="space-y-6">
          {/* Upcoming Events Progress Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-[17px] font-bold text-[#0F172A] font-display">
                Upcoming events
              </h3>
              <Link
                href="/admin/events"
                className="text-[13px] font-bold text-[#F37820] hover:text-[#C24B00] transition"
              >
                Manage
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEventsList.map((event) => (
                <div key={event.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-slate-400 text-xs uppercase overflow-hidden relative border border-[#E2E8F0]">
                    {event.live ? (
                      <span className="absolute inset-0 bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488] font-bold">
                        Live
                      </span>
                    ) : (
                      event.title.slice(0, 2)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[13.5px] font-bold text-[#0F172A] truncate">
                        {event.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#647589] font-semibold mt-0.5">
                      <IconCalendarEvent className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.date}</span>
                    </div>
                    {/* Progress details */}
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-[#0F172A]">
                          {event.sold}{" "}
                          <span className="text-[#647589]">/ {event.total} sold</span>
                        </span>
                        <span className="text-[#F37820]">{event.percentage}%</span>
                      </div>
                      <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#F37820] h-full rounded-full transition-all duration-300"
                          style={{ width: `${event.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inbox Summary Panel */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-[17px] font-bold text-[#0F172A] font-display">
                Inbox
              </h3>
              <span className="text-[11px] font-bold bg-[#0D9488]/10 text-[#0D9488] px-2.5 py-0.5 rounded-full">
                9 new
              </span>
            </div>
            <div className="divide-y divide-[#F1F5F9] -mx-6 -mb-6">
              {inboxMessages.map((msg) => (
                <div
                  key={msg.sender}
                  className="flex items-start gap-3.5 px-6 py-4 hover:bg-[#F8F7F5] transition duration-150 cursor-pointer"
                >
                  <span className="p-2 bg-slate-100 rounded-full text-slate-500">
                    <IconMail className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-bold text-[#0F172A]">
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-[#647589] font-medium">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[#647589] font-medium truncate mt-0.5">
                      {msg.subject}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

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
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { cn } from "@/lib/cn";
import { readStoredAuth } from "@/lib/client-auth";

type DashboardData = {
  stats: {
    eventsCount: number;
    upcomingEvents: number;
    bookingsCount: number;
    ticketsSold: number;
    revenue: number;
  };
  chart: {
    labels: string[];
    values: number[];
  };
  recentBookings: Array<{
    reference: string;
    member: {
      name: string;
      email?: string;
    };
    event: string;
    total: number;
    status: string;
  }>;
  upcomingEvents: Array<{
    title: string;
    date: string;
    sold: number;
    total: number;
    percentage: number;
    live: boolean;
  }>;
};

const emptyDashboard: DashboardData = {
  stats: {
    eventsCount: 0,
    upcomingEvents: 0,
    bookingsCount: 0,
    ticketsSold: 0,
    revenue: 0,
  },
  chart: {
    labels: [],
    values: [],
  },
  recentBookings: [],
  upcomingEvents: [],
};

export default function AdminDashboardPage() {
  const [profile] = useState(() => readStoredAuth());
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/puncak/admin/dashboard", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.message ?? "Dashboard data could not be loaded.");
        }

        setDashboard(payload.data ?? emptyDashboard);
      } catch (err) {
        console.warn("Unable to load admin dashboard data:", err);
        setDashboard(emptyDashboard);
        setError(err instanceof Error ? err.message : "Dashboard data could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const { stats, recentBookings, upcomingEvents } = dashboard;
  const chartLabels = dashboard.chart.labels.length > 0 ? dashboard.chart.labels : ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  const chartValues = dashboard.chart.values.length > 0 ? dashboard.chart.values : [0, 0, 0, 0, 0, 0, 0, 0];

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
      data: chartLabels,
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
        data: chartValues,
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
      change: "Live",
      icon: IconCalendarEvent,
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      title: "Bookings · 30 days",
      value: stats.bookingsCount.toLocaleString(),
      change: "30 days",
      icon: IconTicket,
      iconColor: "text-orange-600 bg-orange-50",
    },
    {
      title: "Tickets sold",
      value: stats.ticketsSold.toLocaleString(),
      change: "30 days",
      icon: IconTag,
      iconColor: "text-teal-600 bg-teal-50",
    },
    {
      title: "Revenue · 30 days",
      value: formatRupiah(stats.revenue),
      change: "Paid",
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
            href="/admin/events/new"
            className="flex items-center gap-2 bg-[#F37820] !text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-sm shadow-orange-500/20 hover:bg-[#C24B00] transition motion-control"
          >
            <IconPlus className="w-4 h-4 text-white" />
            <span>New event</span>
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-5 text-sm font-bold">
          {error}
        </div>
      ) : null}

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
                {loading ? "..." : card.value}
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
                        {formatRupiah(booking.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                            booking.status === "paid"
                              ? "bg-teal-50 text-teal-700"
                              : booking.status === "pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          )}
                        >
                          {labelize(booking.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                        No recent bookings yet.
                      </td>
                    </tr>
                  ) : null}
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
              {upcomingEvents.map((event) => (
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
              {!loading && upcomingEvents.length === 0 ? (
                <div className="rounded-2xl bg-[#F8F7F5] border border-[#E2E8F0] p-5 text-center text-[#647589] text-[14px] font-semibold">
                  No upcoming events yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function formatRupiah(value: number): string {
  if (value <= 0) {
    return "Rp 0";
  }

  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }

  if (value >= 1_000) {
    return `Rp ${Math.round(value / 1_000)}K`;
  }

  return `Rp ${value.toLocaleString("id-ID")}`;
}

function labelize(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

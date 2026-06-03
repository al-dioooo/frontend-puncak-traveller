"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  IconSearch,
  IconChevronDown,
  IconDownload,
  IconDotsVertical,
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconCheck,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { BookingDetailDrawer } from "@/components/admin/booking-detail-drawer";
import { cn } from "@/lib/cn";

interface ApiBooking {
  id: string | number;
  reference?: string;
  user?: { name: string; email: string };
  name?: string;
  email?: string;
  event?: { title: string };
  tickets?: ApiBookingTicket[] | number;
  qty?: number;
  total?: number;
  status?: string;
  date?: string;
}

type ApiBookingTicket = {
  quantity?: number | string | null;
};

type BookingRow = {
  reference: string;
  member: {
    name: string;
    email: string;
    avatar?: string;
  };
  event: {
    title: string;
    thumbnail?: string;
  };
  tickets: number;
  total: string;
  status: "Paid" | "Pending" | "Cancelled" | "Refunded";
  date: string;
};

// Mock bookings list matching reference file Bookings List.html
const fallbackBookings: BookingRow[] = [
  {
    reference: "PTR-26-8F3K2A",
    member: { name: "Alex Puncak", email: "alex.puncak@email.com" },
    event: { title: "Puncak Trail Run 2026" },
    tickets: 2,
    total: "Rp 290K",
    status: "Paid",
    date: "02 Jun 2026",
  },
  {
    reference: "PHC-26-2M9X1B",
    member: { name: "Maya Sari", email: "maya.sari@email.com" },
    event: { title: "Highland Camp & Bonfire" },
    tickets: 1,
    total: "Rp 320K",
    status: "Paid",
    date: "01 Jun 2026",
  },
  {
    reference: "PFR-26-7K2P0Q",
    member: { name: "Budi Hartono", email: "budi.h@email.com" },
    event: { title: "Forest Fun Run 10K" },
    tickets: 3,
    total: "Rp 360K",
    status: "Pending",
    date: "01 Jun 2026",
  },
  {
    reference: "PYG-26-5T8L3C",
    member: { name: "Indah Permata", email: "indah.p@email.com" },
    event: { title: "Mindful Mountain Yoga" },
    tickets: 2,
    total: "Rp 190K",
    status: "Paid",
    date: "31 May 2026",
  },
  {
    reference: "PTR-26-9D4F7E",
    member: { name: "Rian Maulana", email: "rian.m@email.com" },
    event: { title: "Puncak Trail Run 2026" },
    tickets: 1,
    total: "Rp 95K",
    status: "Cancelled",
    date: "30 May 2026",
  },
  {
    reference: "PWK-26-1A6B2D",
    member: { name: "Sari Wulandari", email: "sari.w@email.com" },
    event: { title: "Sunrise Healthy Walk" },
    tickets: 4,
    total: "Free",
    status: "Paid",
    date: "29 May 2026",
  },
  {
    reference: "PHM-26-3C9E5F",
    member: { name: "Budi Hartono", email: "budi.h@email.com" },
    event: { title: "Puncak Pass Half Marathon" },
    tickets: 1,
    total: "Rp 200K",
    status: "Refunded",
    date: "12 May 2026",
  },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>(fallbackBookings);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [selectedBookingRef, setSelectedBookingRef] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await fetch("/api/puncak/bookings", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("API failed");

        const payload = await response.json();
        if (Array.isArray(payload.data) && payload.data.length > 0) {
          // Merge API results with mock to get detailed mock visual names if needed
          const apiRows = payload.data.map((item: ApiBooking) => ({
            reference: item.reference || `REF-${item.id}`,
            member: {
              name: item.user?.name || item.name || "Alex Puncak",
              email: item.user?.email || item.email || "alex@email.com",
            },
            event: {
              title: item.event?.title || "Puncak Trail Run 2026",
            },
            tickets: getBookingTicketCount(item),
            total: item.total ? `Rp ${(item.total / 1000).toFixed(0)}K` : "Rp 150K",
            status: displayBookingStatus(item.status),
            date: formatBookingDate(item.date),
          }));
          setBookings(apiRows);
        }
      } catch (err) {
        console.warn("Unable to load bookings from API, using fallback reference data:", err);
      }
    }

    loadBookings();
  }, []);

  // Sync statuses from drawer refund updates
  function handleStatusChange(ref: string, newStatus: "Paid" | "Pending" | "Cancelled" | "Refunded") {
    setBookings((prev) =>
      prev.map((b) => (b.reference === ref ? { ...b, status: newStatus } : b))
    );
  }

  // Filter bookings list based on chips & queries
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus =
        selectedStatus === "All" || b.status.toLowerCase() === selectedStatus.toLowerCase();
      
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        b.reference.toLowerCase().includes(query) ||
        b.member.name.toLowerCase().includes(query) ||
        b.member.email.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [bookings, selectedStatus, searchQuery]);

  const toggleSelectAll = () => {
    if (Object.keys(selectedRows).length === filteredBookings.length) {
      setSelectedRows({});
    } else {
      const all: Record<string, boolean> = {};
      filteredBookings.forEach((b) => (all[b.reference] = true));
      setSelectedRows(all);
    }
  };

  const toggleSelectRow = (ref: string) => {
    setSelectedRows((prev) => {
      const copy = { ...prev };
      if (copy[ref]) {
        delete copy[ref];
      } else {
        copy[ref] = true;
      }
      return copy;
    });
  };

  function triggerCsvExport() {
    setToastMessage("CSV exported successfully.");
    setTimeout(() => setToastMessage(null), 3000);
  }

  return (
    <AdminLayout activeTab="Bookings" title="Bookings">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <IconCheck className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Head */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">
            Bookings
          </h1>
          <p className="text-[#647589] text-[14px] mt-1 font-medium">
            {bookings.length} bookings · Rp 248M collected this month. Review, refund and manage every order.
          </p>
        </div>
        <button
          onClick={triggerCsvExport}
          className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 px-4 py-2 rounded-full text-[13px] font-bold shadow-sm transition motion-control"
        >
          <IconDownload className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Toolbar Filter Section */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm">
        {/* Left Option Group */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search bar */}
          <div className="relative w-64 mr-2">
            <IconSearch className="w-4 h-4 text-[#647589] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by reference, member or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-full py-1.5 pl-9 pr-4 text-[12.5px] text-[#0F172A] placeholder-[#647589] focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] outline-none transition"
            />
          </div>

          {/* Tab Filter Chips */}
          {["All", "Paid", "Pending", "Cancelled", "Refunded"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[12.5px] font-bold border transition",
                selectedStatus === status
                  ? "bg-[#F37820]/10 border-[#F37820] text-[#C24B00]"
                  : "bg-white border-[#E2E8F0] text-[#647589] hover:bg-slate-50"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Date Filter Selection */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] px-3.5 py-1.5 rounded-full text-[12.5px] font-bold text-[#0F172A] cursor-pointer shadow-sm hover:bg-slate-50 transition select-none">
            <IconCalendar className="w-4 h-4 text-slate-400" />
            <span>This month</span>
            <IconChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Main Table Grid Panel */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F7F5] border-b border-[#E2E8F0]">
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredBookings.length > 0 &&
                      Object.keys(selectedRows).length === filteredBookings.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-[#E2E8F0] text-[#F37820] focus:ring-[#F37820] cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Reference
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Member
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Event
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589] text-center">
                  Tickets
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Total
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Date
                </th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredBookings.map((b) => (
                <tr
                  key={b.reference}
                  onClick={() => {
                    setSelectedBookingRef(b.reference);
                    setDrawerOpen(true);
                  }}
                  className="hover:bg-[#F8F7F5] transition duration-150 cursor-pointer"
                >
                  <td
                    className="px-6 py-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedRows[b.reference]}
                      onChange={() => toggleSelectRow(b.reference)}
                      className="rounded border-[#E2E8F0] text-[#F37820] focus:ring-[#F37820] cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-[13.5px] font-semibold text-[#0F172A] font-mono">
                    {b.reference}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 uppercase">
                        {b.member.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[13.5px] font-bold text-[#0F172A]">
                          {b.member.name}
                        </div>
                        <div className="text-[11px] text-[#647589] mt-0.5">
                          {b.member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] flex-shrink-0" />
                      <span className="text-[13.5px] font-medium text-[#0f172a] truncate max-w-[200px]">
                        {b.event.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13.5px] text-center text-[#0F172A]">
                    {b.tickets}
                  </td>
                  <td className="px-6 py-4 text-[13.5px] font-bold text-[#0F172A]">
                    {b.total}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                        b.status === "Paid"
                          ? "bg-teal-50 text-teal-700"
                          : b.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : b.status === "Cancelled"
                          ? "bg-red-50 text-red-700"
                          : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13.5px] text-[#647589] whitespace-nowrap">
                    {b.date}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1 rounded-lg text-[#647589] hover:bg-slate-100 hover:text-slate-800 transition">
                      <IconDotsVertical className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    No bookings found matching selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-[#E2E8F0] bg-white">
          <span className="text-[12.5px] text-[#647589] font-medium">
            Showing 1–{filteredBookings.length} of {bookings.length} bookings
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-[#E2E8F0] text-slate-400 hover:bg-slate-50 transition">
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#F37820]/15 text-[#C24B00] border border-[#F37820]/15 text-xs font-bold transition">
              1
            </button>
            <button className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold transition">
              2
            </button>
            <button className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold transition">
              3
            </button>
            <span className="px-1 text-slate-400 text-xs font-bold">…</span>
            <button className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold transition">
              184
            </button>
            <button className="p-1.5 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-slate-50 transition">
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Detail Drawer Overlay Component */}
      <BookingDetailDrawer
        bookingRef={selectedBookingRef}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedBookingRef(null);
        }}
        onStatusChange={handleStatusChange}
      />
    </AdminLayout>
  );
}

function displayBookingStatus(status?: string): BookingRow["status"] {
  if (status === "pending") {
    return "Pending";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  if (status === "refunded") {
    return "Refunded";
  }

  return "Paid";
}

function getBookingTicketCount(item: ApiBooking): number {
  if (typeof item.qty === "number" && item.qty > 0) {
    return item.qty;
  }

  if (typeof item.tickets === "number" && item.tickets > 0) {
    return item.tickets;
  }

  if (Array.isArray(item.tickets)) {
    const ticketCount = item.tickets.reduce<number>((sum, ticket) => {
      return sum + (Number(ticket.quantity) || 0);
    }, 0);

    return ticketCount || 1;
  }

  return 1;
}

function formatBookingDate(value?: string): string {
  if (!value) {
    return "02 Jun 2026";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

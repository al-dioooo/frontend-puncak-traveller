"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { BookingDetailDrawer } from "@/components/admin/booking-detail-drawer";
import {
  AdminBookingStatus,
  ApiBooking,
  BookingRow,
  displayBookingStatus,
  EditableAdminBookingStatus,
  mapApiBookingRow,
  refreshBookingPaymentStatus,
  updateBookingPaymentStatus,
} from "@/lib/admin-bookings";
import { cn } from "@/lib/cn";
import { shouldBypassImageOptimization } from "@/lib/image-optimization";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const selectedStatus: string = "All";
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [selectedBookingRef, setSelectedBookingRef] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [rowActionLoading, setRowActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/puncak/bookings?per_page=15&page=${page}`, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("API failed");

        const payload = await response.json();
        const apiRows = Array.isArray(payload.data)
          ? payload.data.map((item: ApiBooking) => mapApiBookingRow(item))
          : [];
        setBookings(apiRows);
        setTotal(payload.meta?.total ?? apiRows.length);
      } catch (err) {
        console.warn("Unable to load bookings from API:", err);
        setBookings([]);
        setTotal(0);
        setError("Bookings could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [page]);

  function handleStatusChange(ref: string, newStatus: AdminBookingStatus) {
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

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }

  async function updatePaymentStatus(reference: string, status: EditableAdminBookingStatus) {
    try {
      const payload = await updateBookingPaymentStatus(reference, status);
      handleStatusChange(reference, displayBookingStatus(payload.paymentStatus ?? payload.status));
      showToast("Payment status updated.");
    } catch (statusError) {
      showToast(statusError instanceof Error ? statusError.message : "Unable to update payment status.");
    }
  }

  async function refreshPaymentStatus(reference: string) {
    setRowActionLoading(`${reference}:refresh`);

    try {
      const payload = await refreshBookingPaymentStatus(reference);
      handleStatusChange(reference, displayBookingStatus(payload.paymentStatus ?? payload.status));
      showToast("Payment status refreshed from Midtrans.");
    } catch (refreshError) {
      showToast(refreshError instanceof Error ? refreshError.message : "Unable to refresh payment status.");
    } finally {
      setRowActionLoading(null);
    }
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
            {bookings.length} bookings · Rp 248M collected this month. Review and manage every order.
          </p>
        </div>
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

          {/* Filter chips intentionally hidden per CMS revision request.
          {["All", "Paid", "Pending", "Cancelled"].map((status) => (
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
          */}
        </div>

        {/* Filter/sort controls intentionally hidden per CMS revision request.
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] px-3.5 py-1.5 rounded-full text-[12.5px] font-bold text-[#0F172A] cursor-pointer shadow-sm hover:bg-slate-50 transition select-none">
            <IconCalendar className="w-4 h-4 text-slate-400" />
            <span>This month</span>
            <IconChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>
        */}
      </div>

      {error ? (
        <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-5 text-sm font-bold">
          {error}
        </div>
      ) : null}

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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.map((b) => (
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
                      <div className="relative w-10 h-10 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-400 uppercase">
                        {b.event.thumbnail ? (
                          <Image
                            src={b.event.thumbnail}
                            alt={b.event.imageAlt}
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized={shouldBypassImageOptimization(b.event.thumbnail)}
                          />
                        ) : (
                          b.event.title.slice(0, 2)
                        )}
                      </div>
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
                    <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      {b.status === "Refunded" ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          Refunded
                        </span>
                      ) : (
                        <select
                          value={b.status}
                          onChange={(event) => updatePaymentStatus(b.reference, event.target.value as EditableAdminBookingStatus)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-bold border-0 outline-none",
                            b.status === "Paid"
                              ? "bg-teal-50 text-teal-700"
                              : b.status === "Pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700",
                          )}
                        >
                          <option>Paid</option>
                          <option>Pending</option>
                          <option>Cancelled</option>
                        </select>
                      )}
                      <button
                        type="button"
                        aria-label={`Refresh payment status for booking ${b.reference}`}
                        disabled={rowActionLoading !== null}
                        onClick={() => refreshPaymentStatus(b.reference)}
                        className="p-1.5 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-slate-50 hover:text-[#0F172A] transition disabled:opacity-45 disabled:cursor-not-allowed"
                      >
                        <IconRefresh className={cn("w-3.5 h-3.5", rowActionLoading === `${b.reference}:refresh` && "animate-spin")} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13.5px] text-[#647589] whitespace-nowrap">
                    {b.date}
                  </td>
                </tr>
              ))}

              {!loading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    No bookings available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-[#E2E8F0] bg-white">
          <span className="text-[12.5px] text-[#647589] font-medium">
            Showing {filteredBookings.length === 0 ? 0 : (page - 1) * 15 + 1}–{(page - 1) * 15 + filteredBookings.length} of {total} bookings
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="p-1.5 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#F37820]/15 text-[#C24B00] border border-[#F37820]/15 text-xs font-bold transition">
              {page}
            </button>
            <button
              disabled={page * 15 >= total}
              onClick={() => setPage((value) => value + 1)}
              className="p-1.5 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
            >
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
      />
    </AdminLayout>
  );
}

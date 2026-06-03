/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import {
  IconX,
  IconCheck,
  IconArrowBackUp,
  IconMail,
  IconRefresh,
  IconCurrencyDollar,
  IconShieldCheck,
  IconExternalLink,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export type BookingDetail = {
  reference: string;
  status: "Paid" | "Pending" | "Cancelled" | "Refunded";
  date: string;
  member: {
    name: string;
    email: string;
    phone: string;
    community: string;
  };
  event: {
    title: string;
    date: string;
    location: string;
  };
  tickets: Array<{
    qty: number;
    type: string;
    price: number;
  }>;
  timeline: Array<{
    title: string;
    time: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
};

// Initial mock details matched to reference page
const fallbackDrawerDetails: Record<string, BookingDetail> = {
  "PTR-26-8F3K2A": {
    reference: "PTR-26-8F3K2A",
    status: "Paid",
    date: "02 Jun 2026",
    member: {
      name: "Alex Puncak",
      email: "alex.puncak@email.com",
      phone: "+62 812 3456 7890",
      community: "Puncak Runners",
    },
    event: {
      title: "Puncak Trail Run 2026",
      date: "14 Jun 2026",
      location: "Gunung Pangrango, Bogor",
    },
    tickets: [
      { qty: 1, type: "21K Trail", price: 185000 },
      { qty: 1, type: "5K Fun", price: 95000 },
    ],
    timeline: [
      { title: "Booking confirmed", time: "2 Jun 2026 · 09:42", icon: IconCheck },
      { title: "Payment received · GoPay", time: "2 Jun 2026 · 09:42", icon: IconCurrencyDollar },
      { title: "Confirmation email sent", time: "2 Jun 2026 · 09:43", icon: IconMail },
      { title: "Ticket QR issued", time: "2 Jun 2026 · 09:43", icon: IconShieldCheck },
    ],
  },
};

type BookingDetailDrawerProps = {
  bookingRef: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (reference: string, newStatus: "Paid" | "Pending" | "Cancelled" | "Refunded") => void;
};

type ApiBookingDetail = {
  reference: string;
  status: string;
  date?: string;
  member?: {
    name?: string;
    email?: string;
    phone?: string;
    community?: string;
  };
  event?: {
    title?: string;
    date?: string;
    location?: string;
  };
  tickets?: Array<{
    name?: string;
    quantity?: number;
    price?: number;
  }>;
  timeline?: Array<{
    title?: string;
    time?: string;
  }>;
};

export function BookingDetailDrawer({
  bookingRef,
  isOpen,
  onClose,
  onStatusChange,
}: BookingDetailDrawerProps) {
  const [details, setDetails] = useState<BookingDetail | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingRef) {
      setDetails(null);
      return;
    }

    let active = true;

    async function loadDetails() {
      try {
        const response = await fetch(`/api/puncak/bookings/${encodeURIComponent(bookingRef)}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("API failed");
        }

        const payload = (await response.json()) as { data: ApiBookingDetail };

        if (active) {
          setDetails(mapApiBookingDetail(payload.data));
        }

        return;
      } catch (error) {
        console.warn("Unable to load booking detail from API, using fallback data:", error);
      }

      if (!active) return;

      if (fallbackDrawerDetails[bookingRef]) {
        setDetails(JSON.parse(JSON.stringify(fallbackDrawerDetails[bookingRef])));
        return;
      }

      // Create dynamically if not exists
      setDetails({
        reference: bookingRef,
        status: bookingRef.includes("PFR") ? "Pending" : bookingRef.includes("PTR-26-9D") ? "Cancelled" : bookingRef.includes("PHM") ? "Refunded" : "Paid",
        date: "01 Jun 2026",
        member: {
          name: bookingRef.includes("PHC") ? "Maya Sari" : bookingRef.includes("PFR") ? "Budi Hartono" : bookingRef.includes("PYG") ? "Indah Permata" : "Rian Maulana",
          email: "member@email.com",
          phone: "+62 813 9876 5432",
          community: bookingRef.includes("PHC") ? "Puncak Campers" : "Puncak Runners",
        },
        event: {
          title: bookingRef.includes("PHC") ? "Highland Camp & Bonfire" : bookingRef.includes("PFR") ? "Forest Fun Run 10K" : bookingRef.includes("PYG") ? "Mindful Mountain Yoga" : "Puncak Trail Run 2026",
          date: "14 Jun 2026",
          location: "Bogor, Indonesia",
        },
        tickets: [
          { qty: 1, type: "General Registration", price: 150000 },
        ],
        timeline: [
          { title: "Booking confirmed", time: "1 Jun 2026 · 11:20", icon: IconCheck },
          { title: "Ticket QR issued", time: "1 Jun 2026 · 11:21", icon: IconShieldCheck },
        ],
      });
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [bookingRef]);

  if (!isOpen || !details) return null;

  // Calculators
  const subtotal = details.tickets.reduce((acc, t) => acc + t.qty * t.price, 0);
  const serviceFee = subtotal > 0 ? 10000 : 0;
  const totalPaid = subtotal + serviceFee;

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function handleResend() {
    setActionLoading("resend");
    setTimeout(() => {
      setActionLoading(null);
      showToast("Confirmation email resent successfully.");
      // Add timeline item
      setDetails((prev) => {
        if (!prev) return null;
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        return {
          ...prev,
          timeline: [
            ...prev.timeline,
            { title: "Confirmation email resent", time: `${dateStr} · ${timeStr}`, icon: IconRefresh },
          ],
        };
      });
    }, 1200);
  }

  async function handleRefund() {
    if (!details) return;
    const ref = details.reference;
    setActionLoading("refund");

    try {
      const response = await fetch(`/api/puncak/bookings/${encodeURIComponent(ref)}/refund`, {
        headers: { Accept: "application/json" },
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to refund booking.");
      }

      setActionLoading(null);
      setDetails((prev) => {
        if (!prev) return null;
        return { ...prev, status: "Refunded" };
      });
      onStatusChange?.(ref, "Refunded");
      showToast("Booking refunded successfully.");
    } catch (error) {
      setActionLoading(null);
      showToast(error instanceof Error ? error.message : "Unable to refund booking.");
    }
  }

  return (
    <>
      {/* Background Scrim */}
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[460px] bg-white shadow-2xl z-50 flex flex-col h-full transform transition-transform duration-300 translate-x-0 font-sans">
        {/* Toast Feed */}
        {toastMessage && (
          <div className="absolute top-4 left-4 right-4 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-bounce">
            <IconCheck className="w-4 h-4 text-teal-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Drawer Header */}
        <div className="flex justify-between items-start px-6 py-5 border-b border-[#E2E8F0]">
          <div>
            <div className="text-[11px] font-bold text-[#647589] uppercase tracking-wider">
              Booking details
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[16px] font-extrabold text-[#0F172A] font-mono">
                {details.reference}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                  details.status === "Paid"
                    ? "bg-teal-50 text-teal-700"
                    : details.status === "Pending"
                    ? "bg-amber-50 text-amber-700"
                    : details.status === "Cancelled"
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-700"
                )}
              >
                {details.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#647589] hover:bg-slate-100 hover:text-slate-800 transition"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Member Card */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-[#647589] uppercase tracking-widest">
              Member
            </h4>
            <div className="bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 uppercase">
                  {details.member.name.slice(0, 2)}
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-[#0F172A]">
                    {details.member.name}
                  </div>
                  <div className="text-[11.5px] text-[#647589] mt-0.5">
                    {details.member.email} · {details.member.phone}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-[#F37820]/10 text-[#C24B00] px-2 py-0.5 rounded">
                {details.member.community}
              </span>
            </div>
          </div>

          {/* Event Card */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-[#647589] uppercase tracking-widest">
              Event
            </h4>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex gap-4">
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-slate-400 text-[14px] border border-[#E2E8F0]">
                Event
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-[13.5px] font-bold text-[#0F172A] truncate">
                  {details.event.title}
                </h5>
                <div className="text-[11.5px] text-[#647589] space-y-0.5 mt-1">
                  <div>Date: {details.event.date}</div>
                  <div>Place: {details.event.location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-[#647589] uppercase tracking-widest">
              Tickets
            </h4>
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
              <table className="w-full text-left text-[12.5px] border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F5] border-b border-[#E2E8F0]">
                    <th className="px-4 py-2 font-bold text-[#647589]">Qty</th>
                    <th className="px-4 py-2 font-bold text-[#647589]">Type</th>
                    <th className="px-4 py-2 font-bold text-[#647589]">Price</th>
                    <th className="px-4 py-2 font-bold text-[#647589] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {details.tickets.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 text-[#647589]">{t.qty}x</td>
                      <td className="px-4 py-2.5 font-semibold text-[#0F172A]">{t.type}</td>
                      <td className="px-4 py-2.5 text-slate-700">
                        Rp {t.price.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-[#0F172A] text-right">
                        Rp {(t.qty * t.price).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotal key values */}
              <div className="bg-[#F8F7F5] px-4 py-3.5 space-y-2 border-t border-[#E2E8F0] text-[12.5px]">
                <div className="flex justify-between">
                  <span className="text-[#647589] font-medium">Subtotal</span>
                  <span className="font-semibold text-[#0F172A]">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647589] font-medium">Service fee</span>
                  <span className="font-semibold text-[#0F172A]">
                    Rp {serviceFee.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="h-px bg-[#E2E8F0] my-2" />
                <div className="flex justify-between text-[13.5px] font-extrabold text-[#0F172A]">
                  <span>Total paid</span>
                  <span>Rp {totalPaid.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-[#647589] uppercase tracking-widest">
              Activity History
            </h4>
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {details.timeline.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-4 items-start relative z-10">
                    <span className="w-7.5 h-7.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-white">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="leading-tight">
                      <div className="text-[13px] font-bold text-[#0F172A]">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#647589] mt-0.5">
                        {item.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-5 border-t border-[#E2E8F0] bg-slate-50/50 flex gap-3">
          <button
            onClick={handleResend}
            disabled={actionLoading !== null || details.status === "Cancelled" || details.status === "Refunded"}
            className="flex-1 bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100 px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === "resend" ? (
              <div className="w-3.5 h-3.5 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <IconRefresh className="w-3.5 h-3.5" />
            )}
            <span>Resend</span>
          </button>
          
          <button
            onClick={handleRefund}
            disabled={actionLoading !== null || details.status === "Refunded" || details.status === "Cancelled"}
            className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50/50 px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === "refund" ? (
              <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <IconArrowBackUp className="w-3.5 h-3.5" />
            )}
            <span>Refund</span>
          </button>

          <button
            onClick={() => showToast("Ticket view opened in a new tab.")}
            disabled={details.status === "Cancelled" || details.status === "Refunded"}
            className="flex-1 bg-[#F37820] text-white hover:bg-[#C24B00] px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconExternalLink className="w-3.5 h-3.5" />
            <span>View Ticket</span>
          </button>
        </div>
      </div>
    </>
  );
}

function mapApiBookingDetail(detail: ApiBookingDetail): BookingDetail {
  return {
    reference: detail.reference,
    status: displayBookingStatus(detail.status),
    date: formatBookingDate(detail.date),
    member: {
      name: detail.member?.name ?? "Puncak Traveller",
      email: detail.member?.email ?? "member@email.com",
      phone: detail.member?.phone ?? "",
      community: detail.member?.community ?? "Puncak Travellers",
    },
    event: {
      title: detail.event?.title ?? "Puncak Travellers event",
      date: detail.event?.date ?? "",
      location: detail.event?.location ?? "Puncak region",
    },
    tickets: (detail.tickets ?? []).map((ticket) => ({
      qty: ticket.quantity ?? 1,
      type: ticket.name ?? "Ticket",
      price: ticket.price ?? 0,
    })),
    timeline: (detail.timeline ?? [{ title: "Booking confirmed", time: detail.date }]).map((item) => ({
      title: item.title ?? "Booking updated",
      time: item.time ?? "",
      icon: IconCheck,
    })),
  };
}

function displayBookingStatus(status?: string): BookingDetail["status"] {
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

function formatBookingDate(value?: string): string {
  if (!value) {
    return "";
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

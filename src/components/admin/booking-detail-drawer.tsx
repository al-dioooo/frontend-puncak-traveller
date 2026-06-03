/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import {
  IconArrowBackUp,
  IconCheck,
  IconExternalLink,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { BookingDetailContent } from "@/components/admin/booking-detail-content";
import {
  AdminBookingStatus,
  BookingDetail,
  displayBookingStatus,
  downloadBookingTicket,
  getAdminBookingDetail,
  refundBooking,
  resendBookingReceipt,
} from "@/lib/admin-bookings";
import { cn } from "@/lib/cn";

type BookingDetailDrawerProps = {
  bookingRef: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (reference: string, newStatus: AdminBookingStatus) => void;
};

export function BookingDetailDrawer({
  bookingRef,
  isOpen,
  onClose,
  onStatusChange,
}: BookingDetailDrawerProps) {
  const [details, setDetails] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingRef || !isOpen) {
      setDetails(null);
      setLoadError("");
      return;
    }

    let active = true;
    const currentBookingRef = bookingRef;

    async function loadDetails() {
      setLoading(true);
      setLoadError("");

      try {
        const nextDetails = await getAdminBookingDetail(currentBookingRef);

        if (active) {
          setDetails(nextDetails);
        }
      } catch (error) {
        if (active) {
          setDetails(null);
          setLoadError(error instanceof Error ? error.message : "Unable to load booking details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [bookingRef, isOpen]);

  if (!isOpen) return null;

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  async function handleResend() {
    if (!details) return;

    setActionLoading("resend");

    try {
      await resendBookingReceipt(details.reference);
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

      setDetails((prev) =>
        prev
          ? {
              ...prev,
              timeline: [
                ...prev.timeline,
                { title: "Confirmation email resent", time: `${dateStr} · ${timeStr}`, type: "resent" },
              ],
            }
          : prev,
      );
      showToast("Confirmation email resent successfully.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to resend receipt.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRefund() {
    if (!details) return;

    setActionLoading("refund");

    try {
      const payload = await refundBooking(details.reference);
      const nextStatus = displayBookingStatus(payload.status);

      setDetails((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      onStatusChange?.(details.reference, nextStatus);
      showToast("Booking refunded successfully.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to refund booking.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDownloadTicket() {
    if (!details) return;

    setActionLoading("ticket");

    try {
      await downloadBookingTicket(details.reference);
      showToast("Ticket downloaded.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to download ticket.");
    } finally {
      setActionLoading(null);
    }
  }

  const disabledForClosedBooking = details?.status === "Cancelled" || details?.status === "Refunded";

  return (
    <>
      <div
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[460px] bg-white shadow-2xl z-50 flex flex-col h-full transform transition-transform duration-300 translate-x-0 font-sans">
        {toastMessage && (
          <div className="absolute top-4 left-4 right-4 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-bounce">
            <IconCheck className="w-4 h-4 text-teal-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex justify-between items-start px-6 py-5 border-b border-[#E2E8F0]">
          <div>
            <div className="text-[11px] font-bold text-[#647589] uppercase tracking-wider">
              Booking details
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[16px] font-extrabold text-[#0F172A] font-mono">
                {details?.reference ?? bookingRef}
              </span>
              {details ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                    details.status === "Paid"
                      ? "bg-teal-50 text-teal-700"
                      : details.status === "Pending"
                      ? "bg-amber-50 text-amber-700"
                      : details.status === "Cancelled"
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-700",
                  )}
                >
                  {details.status}
                </span>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#647589] hover:bg-slate-100 hover:text-slate-800 transition"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 text-center text-[#647589] text-[13px] font-semibold">
              Loading booking details...
            </div>
          ) : loadError ? (
            <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-[13px] font-bold">
              {loadError}
            </div>
          ) : details ? (
            <BookingDetailContent details={details} />
          ) : null}
        </div>

        <div className="px-6 py-5 border-t border-[#E2E8F0] bg-slate-50/50 flex gap-3">
          <button
            onClick={handleResend}
            disabled={!details || actionLoading !== null || disabledForClosedBooking}
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
            disabled={!details || actionLoading !== null || disabledForClosedBooking}
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
            onClick={handleDownloadTicket}
            disabled={!details || actionLoading !== null || disabledForClosedBooking}
            className="flex-1 bg-[#F37820] text-white hover:bg-[#C24B00] px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === "ticket" ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <IconExternalLink className="w-3.5 h-3.5" />
            )}
            <span>View ticket</span>
          </button>
        </div>
      </div>
    </>
  );
}

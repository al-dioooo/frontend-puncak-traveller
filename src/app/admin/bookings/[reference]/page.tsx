"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconEdit,
  IconExternalLink,
  IconLoader,
  IconRefresh,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { BookingDetailContent } from "@/components/admin/booking-detail-content";
import {
  BookingDetail,
  downloadBookingTicket,
  getAdminBookingDetail,
  resendBookingReceipt,
} from "@/lib/admin-bookings";
import { cn } from "@/lib/cn";

type BookingDetailPageContext = {
  params: Promise<{ reference: string }>;
};

export default function AdminBookingDetailPage({ params }: BookingDetailPageContext) {
  const { reference } = use(params);
  const [details, setDetails] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Booking ${reference}`;
  }, [reference]);

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setLoadError("");

      try {
        const payload = await getAdminBookingDetail(reference);

        if (active) {
          setDetails(payload);
        }
      } catch (error) {
        if (active) {
          setDetails(null);
          setLoadError(error instanceof Error ? error.message : "Booking details could not be loaded.");
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
  }, [reference]);

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }

  async function handleResend() {
    if (!details) return;
    setActionLoading("resend");

    try {
      await resendBookingReceipt(details.reference);
      showToast("Confirmation email resent successfully.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to resend receipt.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDownload() {
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
    <AdminLayout activeTab="Bookings" title="Booking details">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <IconCheck className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start gap-5">
        <div className="space-y-1">
          <Link
            href="/admin/bookings"
            className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#F37820] hover:text-[#C24B00] transition"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to bookings</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">
              {details?.reference ?? reference}
            </h1>
            {details ? (
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold",
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
          <p className="text-[#647589] text-[14px] font-medium">
            Booking details, receipt actions and ticket download.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Link
            href={`/admin/bookings/${encodeURIComponent(reference)}/edit`}
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 px-4 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition"
          >
            <IconEdit className="w-4 h-4" />
            <span>Edit status</span>
          </Link>
          <ActionButton
            label="Resend"
            loading={actionLoading === "resend"}
            disabled={!details || actionLoading !== null || disabledForClosedBooking}
            onClick={handleResend}
            icon={<IconRefresh className="w-4 h-4" />}
          />
          <ActionButton
            label="View ticket"
            loading={actionLoading === "ticket"}
            disabled={!details || actionLoading !== null || disabledForClosedBooking}
            onClick={handleDownload}
            icon={<IconExternalLink className="w-4 h-4" />}
            primary
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-[#647589] text-[14px] font-semibold">
          Loading booking details...
        </div>
      ) : loadError ? (
        <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-5 text-sm font-bold">
          {loadError}
        </div>
      ) : details ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <BookingDetailContent details={details} />
        </div>
      ) : null}
    </AdminLayout>
  );
}

type ActionButtonProps = {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  primary?: boolean;
};

function ActionButton({ label, icon, loading, disabled, onClick, primary }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-bold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed",
        primary
          ? "bg-[#F37820] text-white hover:bg-[#C24B00]"
          : "bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50",
      )}
    >
      {loading ? <IconLoader className="w-4 h-4 animate-spin" /> : icon}
      <span>{label}</span>
    </button>
  );
}

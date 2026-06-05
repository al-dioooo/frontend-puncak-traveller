"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconCreditCard,
  IconLoader,
  IconReceipt,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminBookingStatus,
  BookingDetail,
  EditableAdminBookingStatus,
  displayBookingStatus,
  formatRupiah,
  getAdminBookingDetail,
  updateBookingPaymentStatus,
} from "@/lib/admin-bookings";
import { cn } from "@/lib/cn";

type BookingEditPageContext = {
  params: Promise<{ reference: string }>;
};

const statusOptions: Array<{ value: EditableAdminBookingStatus; label: string; desc: string }> = [
  { value: "Paid", label: "Paid", desc: "Payment is captured and booking is confirmed." },
  { value: "Pending", label: "Pending", desc: "Payment is not completed yet." },
  { value: "Cancelled", label: "Cancelled", desc: "Payment failed or booking is cancelled." },
];

export default function AdminBookingEditPage({ params }: BookingEditPageContext) {
  const { reference } = use(params);
  const [details, setDetails] = useState<BookingDetail | null>(null);
  const [status, setStatus] = useState<AdminBookingStatus>("Paid");
  const [initialStatus, setInitialStatus] = useState<AdminBookingStatus>("Paid");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalPaid = useMemo(() => {
    if (!details) return 0;

    const subtotal = details.subtotal ?? details.tickets.reduce((acc, ticket) => acc + ticket.qty * ticket.price, 0);
    const bookingFee = details.bookingFee ?? (subtotal > 0 ? 10000 : 0);

    return details.total ?? subtotal + bookingFee;
  }, [details]);
  const canSaveStatus = !!details && status !== initialStatus && status !== "Refunded";

  useEffect(() => {
    document.title = `Edit booking ${reference}`;
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
          setStatus(payload.status);
          setInitialStatus(payload.status);
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

  async function handleSave() {
    if (!canSaveStatus) return;

    setSaving(true);

    try {
      const payload = await updateBookingPaymentStatus(details.reference, status);
      const nextStatus = displayBookingStatus(payload.paymentStatus ?? payload.status);
      setStatus(nextStatus);
      setInitialStatus(nextStatus);
      setDetails((current) => (current ? { ...current, status: nextStatus, paymentStatus: payload.paymentStatus } : current));
      showToast("Booking status saved successfully.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to save booking status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout activeTab="Bookings" title="Edit booking">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <IconCheck className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link
            href={`/admin/bookings/${encodeURIComponent(reference)}`}
            className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#F37820] hover:text-[#C24B00] transition"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to booking details</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display mt-2">
            Edit booking
          </h1>
          <p className="text-[#647589] text-[14px] font-medium">
            Payment/status only. Booking identity, event, tickets and totals remain read-only.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading || !canSaveStatus}
          className="flex items-center justify-center gap-1.5 bg-[#F37820] text-white hover:bg-[#C24B00] px-5 py-2.5 rounded-full text-[13px] font-bold shadow-sm shadow-orange-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <IconLoader className="w-4 h-4 animate-spin" /> : <IconCheck className="w-4 h-4" />}
          <span>Save status</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-[#647589] text-[14px] font-semibold">
          Loading booking...
        </div>
      ) : loadError ? (
        <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-5 text-sm font-bold">
          {loadError}
        </div>
      ) : details ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-[#0F172A]">
                <IconCreditCard className="w-5 h-5 text-slate-400" />
                <h3 className="text-[16px] font-bold font-display">Payment status</h3>
              </div>

              <div className="grid gap-3">
                {initialStatus === "Refunded" ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#647589]">
                      Current historical status
                    </div>
                    <div className="mt-1 text-[13px] font-bold text-[#0F172A]">
                      Refunded
                    </div>
                  </div>
                ) : null}
                {statusOptions.map((option) => {
                  const selected = status === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      className={cn(
                        "flex gap-3.5 items-start p-3 border rounded-xl cursor-pointer transition select-none text-left",
                        selected
                          ? "bg-[#F8F7F5] border-[#F37820]"
                          : "bg-white border-[#E2E8F0] hover:bg-slate-50",
                      )}
                    >
                      <span
                        className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0",
                          selected ? "border-[#F37820]" : "border-slate-300",
                        )}
                      >
                        {selected && <span className="w-2.5 h-2.5 bg-[#F37820] rounded-full" />}
                      </span>
                      <span className="leading-tight">
                        <span className="block text-[13px] font-bold text-[#0F172A]">{option.label}</span>
                        <span className="block text-[11px] text-[#647589] mt-0.5">{option.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-[#0F172A]">
                <IconReceipt className="w-5 h-5 text-slate-400" />
                <h3 className="text-[16px] font-bold font-display">Read-only booking summary</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-[13px]">
                <SummaryItem label="Reference" value={details.reference} mono />
                <SummaryItem label="Current status" value={details.status} />
                <SummaryItem label="Member" value={`${details.member.name} · ${details.member.email}`} />
                <SummaryItem label="Event" value={details.event.title} />
                <SummaryItem label="Event date" value={details.event.date || "-"} />
                <SummaryItem label="Location" value={details.event.location || "-"} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-2 font-display select-none">
                Totals
              </h3>
              <div className="space-y-3 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#647589] font-semibold">Tickets</span>
                  <span className="font-bold text-[#0F172A]">{details.tickets.reduce((sum, ticket) => sum + ticket.qty, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647589] font-semibold">Total paid</span>
                  <span className="font-bold text-[#0F172A]">{formatRupiah(totalPaid)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-2 font-display select-none">
                Immutable fields
              </h3>
              <p className="text-[12.5px] leading-relaxed text-[#647589] font-medium">
                Ticket lines, member identity, event assignment and totals are preserved for booking history.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function SummaryItem({ label, value, mono }: SummaryItemProps) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F7F5] p-3">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#647589]">{label}</div>
      <div className={cn("mt-1 font-bold text-[#0F172A]", mono ? "font-mono" : "")}>{value}</div>
    </div>
  );
}

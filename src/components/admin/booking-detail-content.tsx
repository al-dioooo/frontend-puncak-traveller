"use client";

import {
  IconCheck,
  IconCurrencyDollar,
  IconMail,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react";
import { BookingDetail, formatRupiah } from "@/lib/admin-bookings";

type BookingDetailContentProps = {
  details: BookingDetail;
};

const timelineIcons = {
  confirmed: IconCheck,
  paid: IconCurrencyDollar,
  email: IconMail,
  issued: IconShieldCheck,
  resent: IconRefresh,
};

export function BookingDetailContent({ details }: BookingDetailContentProps) {
  const subtotal = details.subtotal ?? details.tickets.reduce((acc, t) => acc + t.qty * t.price, 0);
  const serviceFee = details.bookingFee ?? (subtotal > 0 ? 10000 : 0);
  const totalPaid = details.total ?? subtotal + serviceFee;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold text-[#647589] uppercase tracking-widest">
          Member
        </h4>
        <div className="bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 uppercase flex-shrink-0">
              {details.member.name.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-[#0F172A] truncate">
                {details.member.name}
              </div>
              <div className="text-[11.5px] text-[#647589] mt-0.5 truncate">
                {[details.member.email, details.member.phone].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-[#F37820]/10 text-[#C24B00] px-2 py-0.5 rounded flex-shrink-0">
            {details.member.community}
          </span>
        </div>
      </div>

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
              <div>Date: {details.event.date || "-"}</div>
              <div>Place: {details.event.location || "-"}</div>
            </div>
          </div>
        </div>
      </div>

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
              {details.tickets.length > 0 ? (
                details.tickets.map((ticket, idx) => (
                  <tr key={`${ticket.type}-${idx}`} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-[#647589]">{ticket.qty}x</td>
                    <td className="px-4 py-2.5 font-semibold text-[#0F172A]">{ticket.type}</td>
                    <td className="px-4 py-2.5 text-slate-700">{formatRupiah(ticket.price)}</td>
                    <td className="px-4 py-2.5 font-bold text-[#0F172A] text-right">
                      {formatRupiah(ticket.qty * ticket.price)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[#647589]">
                    No ticket rows recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="bg-[#F8F7F5] px-4 py-3.5 space-y-2 border-t border-[#E2E8F0] text-[12.5px]">
            <div className="flex justify-between">
              <span className="text-[#647589] font-medium">Subtotal</span>
              <span className="font-semibold text-[#0F172A]">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#647589] font-medium">Service fee</span>
              <span className="font-semibold text-[#0F172A]">{formatRupiah(serviceFee)}</span>
            </div>
            <div className="h-px bg-[#E2E8F0] my-2" />
            <div className="flex justify-between text-[13.5px] font-extrabold text-[#0F172A]">
              <span>Total paid</span>
              <span>{formatRupiah(totalPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[11px] font-bold text-[#647589] uppercase tracking-widest">
          Activity History
        </h4>
        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {details.timeline.map((item, idx) => {
            const Icon = timelineIconFor(item);

            return (
              <div key={`${item.title}-${idx}`} className="flex gap-4 items-start relative z-10">
                <span className="w-7.5 h-7.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-white">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div className="leading-tight">
                  <div className="text-[13px] font-bold text-[#0F172A]">{item.title}</div>
                  <div className="text-[11px] text-[#647589] mt-0.5">{item.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function timelineIconFor(item: BookingDetail["timeline"][number]) {
  if (item.type && item.type in timelineIcons) {
    return timelineIcons[item.type as keyof typeof timelineIcons];
  }

  const title = item.title.toLowerCase();

  if (title.includes("payment")) {
    return IconCurrencyDollar;
  }

  if (title.includes("email")) {
    return title.includes("resent") ? IconRefresh : IconMail;
  }

  if (title.includes("ticket") || title.includes("qr")) {
    return IconShieldCheck;
  }

  return IconCheck;
}

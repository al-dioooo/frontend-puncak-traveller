import type { Metadata } from "next";
import { BookingTicketStep } from "@/components/booking/booking-flow-provider";

export const metadata: Metadata = {
  title: "Select Tickets | Puncak Travellers",
  description: "Choose ticket quantities for a Puncak Travellers event.",
};

export default function BookingTicketsPage() {
  return <BookingTicketStep />;
}

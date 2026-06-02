import type { Metadata } from "next";
import { BookingConfirmStep } from "@/components/booking/booking-flow-provider";

export const metadata: Metadata = {
  title: "Confirm Booking | Puncak Travellers",
  description: "Review attendees, ticket totals, and booking policy before confirmation.",
};

export default function BookingConfirmPage() {
  return <BookingConfirmStep />;
}

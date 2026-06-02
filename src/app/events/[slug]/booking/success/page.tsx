import type { Metadata } from "next";
import { BookingSuccessStep } from "@/components/booking/booking-flow-provider";

export const metadata: Metadata = {
  title: "Booking Confirmed | Puncak Travellers",
  description: "Your Puncak Travellers booking confirmation and ticket actions.",
};

export default function BookingSuccessPage() {
  return <BookingSuccessStep />;
}

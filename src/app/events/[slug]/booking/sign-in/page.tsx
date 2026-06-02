import type { Metadata } from "next";
import { BookingSignInStep } from "@/components/booking/booking-flow-provider";

export const metadata: Metadata = {
  title: "Sign In to Book | Puncak Travellers",
  description: "Sign in with Google or email and password before confirming your booking.",
};

export default function BookingSignInPage() {
  return <BookingSignInStep />;
}

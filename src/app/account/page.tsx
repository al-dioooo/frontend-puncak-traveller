import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { PublicPageShell } from "@/components/site/public-page-shell";

export const metadata: Metadata = {
  title: "Account | Puncak Travellers",
  description: "View Puncak Travellers bookings, tickets, saved events, and account details.",
};

export default function AccountPage() {
  return (
    <PublicPageShell>
      <AccountDashboard />
    </PublicPageShell>
  );
}

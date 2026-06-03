"use client";

import { useMemo, useState } from "react";
import { AccountBookingCard } from "@/components/site/cards";
import { ActionButton } from "@/components/ui/action-button";
import type { AccountBooking } from "@/lib/reference-data";

type AccountTab = AccountBooking["status"];

const tabs: Array<{ value: AccountTab; label: string }> = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "saved", label: "Saved" },
];

type AccountTabsProps = {
  bookings: AccountBooking[];
  refreshingReference?: string;
  onRefreshPaymentStatus?: (reference: string) => void;
};

export function AccountTabs({
  bookings,
  refreshingReference,
  onRefreshPaymentStatus,
}: AccountTabsProps) {
  const [activeTab, setActiveTab] = useState<AccountTab>("upcoming");

  const visibleBookings = useMemo(
    () => bookings.filter((booking) => booking.status === activeTab),
    [activeTab, bookings],
  );

  return (
    <section className="section account-tabs-section" aria-labelledby="account-bookings-title">
      <div className="wrap">
        <div className="account-tabs js-reveal" role="tablist" aria-label="Account booking tabs">
          {tabs.map((tab) => {
            const count = bookings.filter((booking) => booking.status === tab.value).length;
            return (
              <ActionButton
                key={tab.value}
                role="tab"
                size="sm"
                variant={activeTab === tab.value ? "primary" : "outline"}
                aria-selected={activeTab === tab.value}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label} {count}
              </ActionButton>
            );
          })}
        </div>

        <div className="listing-header">
          <div>
            <p className="eyebrow eyebrow-teal">Account</p>
            <h2 id="account-bookings-title">
              {activeTab === "upcoming"
                ? "Upcoming adventures"
                : activeTab === "past"
                  ? "Recently completed"
                  : "Saved adventures"}
            </h2>
          </div>
        </div>

        <div className="account-booking-list">
          {visibleBookings.length > 0 ? (
            visibleBookings.map((booking) => (
              <AccountBookingCard
                key={booking.id}
                booking={booking}
                refreshing={refreshingReference === booking.reference}
                onRefreshPaymentStatus={onRefreshPaymentStatus}
              />
            ))
          ) : (
            <div className="empty-panel">
              <h2>No {activeTab} adventures yet</h2>
              <p>
                {activeTab === "saved"
                  ? "Save events from the event detail page and they will appear here."
                  : "Your bookings will appear here after checkout."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

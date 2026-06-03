"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoginPanel } from "@/components/auth/login-panel";
import { AccountTabs } from "@/components/account/account-tabs";
import { PageHero } from "@/components/site/page-hero";
import { writeStoredAuth } from "@/lib/client-auth";
import type { AccountBooking } from "@/lib/reference-data";

type AccountProfile = {
  name: string;
  email?: string;
  location?: string;
  memberSince: string;
  crew?: string;
  role?: string;
  stats: Array<{ value: string; label: string }>;
};

type ApiUser = {
  name: string;
  email: string;
  location?: string | null;
  memberSince?: string | null;
  crew?: string | null;
  role?: string | null;
  stats?: {
    eventsBooked: number;
    completed: number;
    kilometersLogged: number;
  };
};

type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

const fallbackProfile: AccountProfile = {
  name: "Puncak Traveller",
  location: "Indonesia",
  memberSince: "2026",
  crew: "Puncak Travellers",
  stats: [
    { value: "0", label: "Events booked" },
    { value: "0", label: "Completed" },
    { value: "0", label: "KM logged" },
  ],
};

export function AccountDashboard() {
  const [sessionReady, setSessionReady] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshingReference, setRefreshingReference] = useState("");
  const [message, setMessage] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setSessionReady(true);
    });
  }, []);

  useEffect(() => {
    if (!sessionReady) {
      return;
    }

    let active = true;

    async function loadAccount() {
      setLoading(true);
      setMessage("");

      try {
        const [profileResponse, bookingsResponse, savedResponse] = await Promise.all([
          fetch("/api/puncak/me", {
            cache: "no-store",
            headers: authHeaders(),
          }),
          fetch("/api/puncak/bookings?status=all", {
            cache: "no-store",
            headers: authHeaders(),
          }),
          fetch("/api/puncak/me/saved-events", {
            cache: "no-store",
            headers: authHeaders(),
          }),
        ]);

        if (!profileResponse.ok) {
          throw new Error("Unable to load your account.");
        }

        const profilePayload = (await profileResponse.json()) as ApiEnvelope<ApiUser>;
        const bookingPayload = bookingsResponse.ok
          ? ((await bookingsResponse.json()) as ApiEnvelope<AccountBooking[]>)
          : { data: [] };
        const savedPayload = savedResponse.ok
          ? ((await savedResponse.json()) as ApiEnvelope<AccountBooking[]>)
          : { data: [] };

        if (!active) return;

        setProfile(mapProfile(profilePayload.data));
        writeStoredAuth({
          email: profilePayload.data.email,
          name: profilePayload.data.name,
          role: profilePayload.data.role ?? undefined,
        });
        setSignedOut(false);
        setBookings([...bookingPayload.data, ...savedPayload.data]);
      } catch (error) {
        if (!active) return;
        setProfile(null);
        setBookings([]);
        setSignedOut(true);
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your account right now.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    queueMicrotask(() => {
      if (active) {
        loadAccount();
      }
    });

    return () => {
      active = false;
    };
  }, [sessionReady]);

  const reloadBookings = useCallback(async () => {
    const [bookingsResponse, savedResponse] = await Promise.all([
      fetch("/api/puncak/bookings?status=all", {
        cache: "no-store",
        headers: authHeaders(),
      }),
      fetch("/api/puncak/me/saved-events", {
        cache: "no-store",
        headers: authHeaders(),
      }),
    ]);

    const bookingPayload = bookingsResponse.ok
      ? ((await bookingsResponse.json()) as ApiEnvelope<AccountBooking[]>)
      : { data: [] };
    const savedPayload = savedResponse.ok
      ? ((await savedResponse.json()) as ApiEnvelope<AccountBooking[]>)
      : { data: [] };

    setBookings([...bookingPayload.data, ...savedPayload.data]);
  }, []);

  const refreshBookingPaymentStatus = useCallback(
    async (reference: string) => {
      setRefreshingReference(reference);
      setRefreshMessage("");

      try {
        const response = await fetch(`/api/puncak/bookings/${encodeURIComponent(reference)}/payment-status/sync`, {
          cache: "no-store",
          headers: authHeaders(),
          method: "POST",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message ?? "Unable to refresh payment status.");
        }

        await reloadBookings();
        setRefreshMessage("Payment status refreshed.");
      } catch (error) {
        setRefreshMessage(error instanceof Error ? error.message : "Unable to refresh payment status.");
      } finally {
        setRefreshingReference("");
      }
    },
    [reloadBookings],
  );

  const activeProfile = profile ?? fallbackProfile;
  const initializing = !sessionReady;
  const heroLead = useMemo(
    () =>
      `${activeProfile.location ?? "Indonesia"} - Member since ${activeProfile.memberSince} - ${
        activeProfile.crew ?? "Puncak Travellers"
      }`,
    [activeProfile],
  );

  if (!initializing && !loading && signedOut) {
    return (
      <>
        <PageHero
          compact
          eyebrow="Account"
          title="Sign in to view your trips"
          lead="Manage bookings, saved events, tickets, and profile details from one place."
          image="/pages/account-hero.jpg"
          imageAlt="Puncak Travellers community members on a forest trail"
        />
        <section className="section account-login-section" aria-label="Account sign in">
          <div className="wrap account-login-wrap">
            <LoginPanel returnTo="/account" />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        compact
        eyebrow={loading || initializing ? "Loading account" : "Halo, welcome back"}
        title={activeProfile.name}
        lead={heroLead}
        image="/pages/account-hero.jpg"
        imageAlt="Puncak Travellers community members on a forest trail"
        stats={activeProfile.stats}
      />
      {loading || initializing ? (
        <section className="section" aria-live="polite">
          <div className="wrap">
            <div className="empty-panel">
              <h2>Loading your account</h2>
              <p>Fetching your latest bookings and saved adventures.</p>
            </div>
          </div>
        </section>
      ) : message ? (
        <section className="section" aria-live="polite">
          <div className="wrap">
            <div className="empty-panel">
              <h2>Account data unavailable</h2>
              <p>{message}</p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {refreshMessage ? (
            <section className="section" aria-live="polite">
              <div className="wrap">
                <p className="form-status">{refreshMessage}</p>
              </div>
            </section>
          ) : null}
          <AccountTabs
            bookings={bookings}
            refreshingReference={refreshingReference}
            onRefreshPaymentStatus={refreshBookingPaymentStatus}
          />
        </>
      )}
    </>
  );
}

function authHeaders(): HeadersInit {
  return {
    Accept: "application/json",
  };
}

function mapProfile(user: ApiUser): AccountProfile {
  return {
    name: user.name,
    email: user.email,
    location: user.location ?? "Indonesia",
    memberSince: user.memberSince ?? "2026",
    crew: user.crew ?? "Puncak Travellers",
    role: user.role ?? undefined,
    stats: [
      { value: String(user.stats?.eventsBooked ?? 0), label: "Events booked" },
      { value: String(user.stats?.completed ?? 0), label: "Completed" },
      { value: String(user.stats?.kilometersLogged ?? 0), label: "KM logged" },
    ],
  };
}

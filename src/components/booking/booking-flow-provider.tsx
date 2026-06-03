"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowRight,
  IconCheck,
  IconMinus,
  IconPlus,
  IconTicket,
} from "@tabler/icons-react";
import { Badge } from "@/components/landing/badge";
import { ButtonLink } from "@/components/landing/button-link";
import { ActionButton } from "@/components/ui/action-button";
import { LoginPanel } from "@/components/auth/login-panel";
import {
  bookingFee,
  formatRupiah,
  type EventDetail,
} from "@/lib/reference-data";
import {
  authStorageKey,
  readStoredAuth,
  writeStoredAuth,
  type StoredAuth,
} from "@/lib/client-auth";

type Quantities = Record<string, number>;

type BookingContextValue = {
  event: EventDetail;
  quantities: Quantities;
  subtotal: number;
  total: number;
  selectedCount: number;
  selectedRows: Array<{
    id: string;
    name: string;
    quantity: number;
    lineTotal: number;
  }>;
  confirmationReference: string;
  termsAccepted: boolean;
  signedIn: boolean;
  userDisplayName: string;
  setTermsAccepted: (accepted: boolean) => void;
  setSignedIn: (signedIn: boolean) => void;
  changeQuantity: (ticketId: string, delta: number) => void;
  confirmBooking: () => Promise<string>;
};

const BookingContext = createContext<BookingContextValue | null>(null);

type BookingFlowProviderProps = {
  event: EventDetail;
  children: ReactNode;
};

export function BookingFlowProvider({ event, children }: BookingFlowProviderProps) {
  const storageKey = `puncak.booking.${event.slug}`;
  const [quantities, setQuantities] = useState<Quantities>({});
  const [confirmationReference, setConfirmationReference] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredAuth | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;

      const rawBooking = window.localStorage.getItem(storageKey);
      const hasStoredAuth = Boolean(window.localStorage.getItem(authStorageKey));
      const storedAuth = hasStoredAuth ? readStoredAuth() : null;

      if (rawBooking) {
        try {
          const parsed = JSON.parse(rawBooking) as {
            quantities?: Quantities;
            confirmationReference?: string;
            idempotencyKey?: string;
            termsAccepted?: boolean;
          };
          setQuantities(parsed.quantities ?? {});
          setConfirmationReference(parsed.idempotencyKey ? parsed.confirmationReference ?? "" : "");
          setIdempotencyKey(parsed.idempotencyKey ?? crypto.randomUUID());
          setTermsAccepted(Boolean(parsed.termsAccepted));
        } catch {
          window.localStorage.removeItem(storageKey);
          setIdempotencyKey(crypto.randomUUID());
        }
      } else {
        setIdempotencyKey(crypto.randomUUID());
      }

      if (storedAuth) {
        setCurrentUser(storedAuth);
        setSignedIn(true);
      }

      setHydrated(true);
    });

    return () => {
      active = false;
    };
  }, [storageKey]);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/puncak/me", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();

        if (active) {
          const nextAuth = {
            email: payload.data?.email,
            name: payload.data?.name ?? "Puncak Traveller",
            role: payload.data?.role,
          };

          writeStoredAuth(nextAuth);
          setCurrentUser(nextAuth);
          setSignedIn(true);
        }
      } catch {
        if (active) {
          setSignedIn(false);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        confirmationReference,
        idempotencyKey,
        quantities,
        termsAccepted,
      }),
    );
  }, [confirmationReference, hydrated, idempotencyKey, quantities, storageKey, termsAccepted]);

  const selectedRows = useMemo(
    () =>
      event.tickets
        .map((ticket) => {
          const quantity = quantities[ticket.id] ?? 0;
          return {
            id: ticket.id,
            lineTotal: ticket.price * quantity,
            name: ticket.name,
            quantity,
          };
        })
        .filter((row) => row.quantity > 0),
    [event.tickets, quantities],
  );

  const subtotal = selectedRows.reduce((sum, row) => sum + row.lineTotal, 0);
  const selectedCount = selectedRows.reduce((sum, row) => sum + row.quantity, 0);
  const total = selectedCount > 0 ? subtotal + bookingFee : 0;
  const userDisplayName = currentUser?.name?.trim() || "Puncak Traveller";

  const changeQuantity = useCallback(
    (ticketId: string, delta: number) => {
      const ticket = event.tickets.find((item) => item.id === ticketId);
      if (!ticket || ticket.stock === 0) return;

      setQuantities((current) => {
        const nextValue = Math.min(
          ticket.stock,
          Math.max(0, (current[ticketId] ?? 0) + delta),
        );
        return { ...current, [ticketId]: nextValue };
      });
    },
    [event.tickets],
  );

  const updateSignedIn = useCallback((nextSignedIn: boolean) => {
    setSignedIn(nextSignedIn);
    setCurrentUser(nextSignedIn ? readStoredAuth() : null);
  }, []);

  const confirmBooking = useCallback(async () => {
    if (confirmationReference) {
      return confirmationReference;
    }

    const auth = currentUser ?? readStoredAuth();
    const attendeeName = auth?.name?.trim() || "Puncak Traveller";
    const attendees = auth?.email
      ? selectedRows.flatMap((row) =>
          Array.from({ length: row.quantity }, (_, index) => ({
            email: auth.email,
            name:
              index === 0
                ? attendeeName
                : `${attendeeName} ${index + 1}`,
            ticketTierId: row.id,
          })),
        )
      : undefined;

    const response = await fetch("/api/puncak/bookings", {
      body: JSON.stringify({
        ...(attendees ? { attendees } : {}),
        eventSlug: event.slug,
        items: selectedRows.map((row) => ({
          quantity: row.quantity,
          ticketTierId: row.id,
        })),
        termsAccepted,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      method: "POST",
    });

    const payload = (await response.json().catch(() => ({}))) as {
      data?: { reference?: string };
      message?: string;
    };

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Sign in before confirming your booking.");
      }

      throw new Error(payload.message ?? "Unable to confirm this booking.");
    }

    const nextReference = payload.data?.reference;
    if (!nextReference) {
      throw new Error("The booking response did not include a reference.");
    }

    setConfirmationReference(nextReference);
    return nextReference;
  }, [
    confirmationReference,
    currentUser,
    event.slug,
    idempotencyKey,
    selectedRows,
    termsAccepted,
  ]);

  const value = useMemo<BookingContextValue>(
    () => ({
      changeQuantity,
      confirmBooking,
      confirmationReference,
      event,
      quantities,
      selectedCount,
      selectedRows,
      setSignedIn: updateSignedIn,
      setTermsAccepted,
      signedIn,
      subtotal,
      termsAccepted,
      total,
      userDisplayName,
    }),
    [
      changeQuantity,
      confirmBooking,
      confirmationReference,
      event,
      quantities,
      selectedCount,
      selectedRows,
      signedIn,
      subtotal,
      termsAccepted,
      total,
      updateSignedIn,
      userDisplayName,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookingFlow() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookingFlow must be used inside BookingFlowProvider.");
  }

  return context;
}

export function BookingTicketStep() {
  const { event, quantities, selectedCount, changeQuantity } = useBookingFlow();

  return (
    <CheckoutFrame
      eyebrow="1 Tickets"
      title="Choose your tickets"
      lead="Pick a distance and how many spots you need."
      nextHref={`${event.bookingHref}/sign-in`}
      nextLabel="Continue to sign in"
      nextDisabled={selectedCount === 0}
    >
      <div className="ticket-list">
        {event.tickets.map((ticket) => {
          const quantity = quantities[ticket.id] ?? 0;
          const soldOut = ticket.stock === 0;
          return (
            <article key={ticket.id} className="ticket-row js-card">
              <div>
                <div className="ticket-row-head">
                  <h2>{ticket.name}</h2>
                  <Badge tone={soldOut ? "navy" : "teal"}>{soldOut ? "Sold out" : ticket.capacityLabel}</Badge>
                </div>
                <p>{ticket.description}</p>
                <strong>{ticket.priceLabel}</strong>
              </div>
              <div className="stepper" aria-label={`${ticket.name} quantity`}>
                <ActionButton
                  size="sm"
                  variant="outline"
                  aria-label={`Decrease ${ticket.name}`}
                  disabled={quantity === 0}
                  onClick={() => changeQuantity(ticket.id, -1)}
                >
                  <IconMinus aria-hidden size={16} />
                </ActionButton>
                <span>{quantity}</span>
                <ActionButton
                  size="sm"
                  variant="outline"
                  aria-label={`Increase ${ticket.name}`}
                  disabled={soldOut || quantity >= ticket.stock}
                  onClick={() => changeQuantity(ticket.id, 1)}
                >
                  <IconPlus aria-hidden size={16} />
                </ActionButton>
              </div>
            </article>
          );
        })}
      </div>
      <p className="checkout-note">
        Tickets are held for 10 minutes once you continue. We never oversell - your spot is guaranteed at checkout.
      </p>
    </CheckoutFrame>
  );
}

export function BookingSignInStep() {
  const { event, setSignedIn } = useBookingFlow();

  return (
    <CheckoutFrame
      eyebrow="2 Sign in"
      title="Sign in to book"
      lead="Booking is members-only so we can send your ticket and event updates."
    >
      <RequireSelection>
        <LoginPanel
          compact
          returnTo={`${event.bookingHref}/confirm`}
          onAuthenticated={() => setSignedIn(true)}
        />
      </RequireSelection>
    </CheckoutFrame>
  );
}

export function BookingConfirmStep() {
  const router = useRouter();
  const {
    event,
    selectedRows,
    selectedCount,
    termsAccepted,
    userDisplayName,
    setTermsAccepted,
    confirmBooking,
  } = useBookingFlow();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!termsAccepted || selectedCount === 0 || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      await confirmBooking();
      router.push(`${event.bookingHref}/success`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to confirm this booking.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CheckoutFrame
      eyebrow="3 Confirm"
      title="Confirm your booking"
      lead="Almost there. Review the details and confirm your spot."
    >
      <RequireSelection>
        <div className="confirm-stack">
          <section className="confirm-panel js-card" aria-labelledby="attendees-title">
            <h2 id="attendees-title">Attendees</h2>
            {selectedRows.flatMap((row) =>
              Array.from({ length: row.quantity }, (_, index) => (
                <div key={`${row.id}-${index}`} className="attendee-row">
                  <span>{index === 0 && row.id === selectedRows[0]?.id ? userDisplayName : `Traveller ${index + 1}`}</span>
                  <small>{row.name}</small>
                </div>
              )),
            )}
          </section>

          <section className="confirm-panel js-card" aria-labelledby="payment-title">
            <h2 id="payment-title">Payment</h2>
            <p>
              This event is a reservation checkout. Pay the booking fee on arrival, or settle online when payments go live.
            </p>
          </section>

          <label className="terms-row js-card">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
            />
            <span>
              I agree to the booking policy and trail safety guidelines, and confirm attendee details are correct.
            </span>
          </label>

          <ActionButton
            className="checkout-wide-action"
            disabled={!termsAccepted || selectedCount === 0 || submitting}
            icon={IconCheck}
            onClick={submit}
          >
            {submitting ? "Confirming..." : "Confirm booking"}
          </ActionButton>
          <p className="checkout-note">Submitting once is safe - duplicate clicks will not double-book.</p>
          {error ? (
            <p className="form-status form-status-error" aria-live="polite">
              {error}
            </p>
          ) : null}
        </div>
      </RequireSelection>
    </CheckoutFrame>
  );
}

export function BookingSuccessStep() {
  const {
    event,
    confirmationReference,
    selectedCount,
    selectedRows,
    userDisplayName,
  } = useBookingFlow();
  const ticketSummary = selectedRows.map((row) => row.name.split(" ")[0]).join(" + ");

  return (
    <CheckoutFrame
      eyebrow="Booking confirmed"
      title={`You are in, ${userDisplayName}!`}
      lead={`Your spot for ${event.title} is locked in. We emailed your tickets and added them to your account.`}
      hideSummary
    >
      <RequireSelection requireReference>
        <section className="success-panel js-card">
          <Badge tone="teal">Upcoming</Badge>
          <h2>{event.title}</h2>
          <div className="success-meta">
            <span>{event.date}</span>
            <span>{event.location}</span>
          </div>
          <div className="success-reference">
            <span>Booking reference</span>
            <strong>{confirmationReference}</strong>
          </div>
          <p>
            {selectedCount} tickets{ticketSummary ? ` - ${ticketSummary}` : ""}
          </p>
          <div className="success-actions">
            <ButtonLink href="/account" icon={IconArrowRight}>
              View in my account
            </ButtonLink>
            <ButtonLink href="/account" variant="outline">
              Download tickets
            </ButtonLink>
            <ButtonLink href="/account" variant="light">
              Add to calendar
            </ButtonLink>
          </div>
        </section>
      </RequireSelection>
    </CheckoutFrame>
  );
}

type CheckoutFrameProps = {
  eyebrow: string;
  title: string;
  lead: string;
  nextHref?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  hideSummary?: boolean;
  children: ReactNode;
};

function CheckoutFrame({
  eyebrow,
  title,
  lead,
  nextHref,
  nextLabel,
  nextDisabled,
  hideSummary = false,
  children,
}: CheckoutFrameProps) {
  const { event } = useBookingFlow();

  return (
    <div className="checkout-page">
      <CheckoutHeader event={event} />
      <main className="checkout-main">
        <section className="checkout-content js-checkout-step">
          <p className="eyebrow eyebrow-teal">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{lead}</p>
          {children}
          {nextHref && nextLabel ? (
            nextDisabled ? (
              <ActionButton className="checkout-wide-action" disabled icon={IconArrowRight}>
                {nextLabel}
              </ActionButton>
            ) : (
              <ButtonLink className="checkout-wide-action" href={nextHref} icon={IconArrowRight}>
                {nextLabel}
              </ButtonLink>
            )
          ) : null}
        </section>
        {hideSummary ? null : <OrderSummary />}
      </main>
    </div>
  );
}

function CheckoutHeader({ event }: { event: EventDetail }) {
  return (
    <header className="checkout-header">
      <Link href={event.detailHref} className="checkout-cancel">
        Cancel
      </Link>
      <div className="checkout-brand">
        <IconTicket aria-hidden size={18} />
        <span>Secure checkout</span>
      </div>
      <div className="checkout-steps" aria-label="Checkout steps">
        <span>Tickets</span>
        <span>Sign in</span>
        <span>Confirm</span>
      </div>
    </header>
  );
}

function OrderSummary() {
  const { event, selectedRows, selectedCount, subtotal, total } = useBookingFlow();

  return (
    <aside className="order-summary js-card" aria-label="Booking summary">
      <h2>{event.title}</h2>
      <div className="order-summary-meta">
        <span>{event.date}</span>
        <span>{event.location}</span>
      </div>
      <div className="order-lines">
        {selectedRows.length > 0 ? (
          selectedRows.map((row) => (
            <div key={row.id}>
              <span>
                {row.quantity} x {row.name}
              </span>
              <strong>{formatRupiah(row.lineTotal)}</strong>
            </div>
          ))
        ) : (
          <p>No tickets selected yet.</p>
        )}
      </div>
      <div className="order-total">
        <div>
          <span>Subtotal</span>
          <strong>{formatRupiah(subtotal)}</strong>
        </div>
        <div>
          <span>Booking fee</span>
          <strong>{selectedCount > 0 ? formatRupiah(bookingFee) : formatRupiah(0)}</strong>
        </div>
        <div>
          <span>Total</span>
          <strong>{formatRupiah(total)}</strong>
        </div>
      </div>
    </aside>
  );
}

function RequireSelection({
  children,
  requireReference = false,
}: {
  children: ReactNode;
  requireReference?: boolean;
}) {
  const { event, selectedCount, confirmationReference } = useBookingFlow();

  if (selectedCount === 0) {
    return (
      <div className="empty-panel">
        <h2>No tickets selected</h2>
        <p>Choose at least one ticket before continuing checkout.</p>
        <ButtonLink href={event.bookingHref}>Choose tickets</ButtonLink>
      </div>
    );
  }

  if (requireReference && !confirmationReference) {
    return (
      <div className="empty-panel">
        <h2>Confirm your booking first</h2>
        <p>The success screen appears after your booking is confirmed.</p>
        <ButtonLink href={`${event.bookingHref}/confirm`}>Back to confirm</ButtonLink>
      </div>
    );
  }

  return <>{children}</>;
}

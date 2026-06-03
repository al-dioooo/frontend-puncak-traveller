export type AdminBookingStatus = "Paid" | "Pending" | "Cancelled" | "Refunded";

export type ApiBookingTicket = {
  name?: string;
  quantity?: number | string | null;
  price?: number;
};

export type ApiBooking = {
  id: string | number;
  reference?: string;
  user?: { id?: string; name?: string; email?: string };
  name?: string;
  email?: string;
  event?: {
    title?: string;
    date?: string;
    location?: string;
    imageUrl?: string | null;
    imageAlt?: string | null;
  };
  tickets?: ApiBookingTicket[] | number;
  qty?: number;
  total?: number;
  status?: string;
  paymentStatus?: string;
  date?: string;
};

export type BookingRow = {
  reference: string;
  member: {
    name: string;
    email: string;
    avatar?: string;
  };
  event: {
    title: string;
    thumbnail?: string;
    imageAlt: string;
  };
  tickets: number;
  total: string;
  status: AdminBookingStatus;
  date: string;
};

export type BookingDetail = {
  reference: string;
  status: AdminBookingStatus;
  paymentStatus?: string;
  date: string;
  member: {
    name: string;
    email: string;
    phone: string;
    community: string;
  };
  event: {
    title: string;
    date: string;
    location: string;
  };
  tickets: Array<{
    qty: number;
    type: string;
    price: number;
  }>;
  subtotal?: number;
  bookingFee?: number;
  total?: number;
  timeline: Array<{
    title: string;
    time: string;
    type?: string;
  }>;
};

type ApiBookingDetail = ApiBooking & {
  member?: {
    name?: string;
    email?: string;
    phone?: string;
    community?: string;
  };
  subtotal?: number;
  bookingFee?: number;
  currency?: string;
  timeline?: Array<{
    title?: string;
    time?: string;
    type?: string;
  }>;
};

type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

type BookingActionResponse = {
  reference: string;
  status?: string;
  paymentStatus?: string;
  resentAt?: string;
};

export function mapApiBookingRow(item: ApiBooking): BookingRow {
  return {
    reference: item.reference || `REF-${item.id}`,
    member: {
      name: item.user?.name || item.name || "Unknown member",
      email: item.user?.email || item.email || "unknown@email.com",
    },
    event: {
      title: item.event?.title || "Puncak Travellers event",
      thumbnail: item.event?.imageUrl || "",
      imageAlt: item.event?.imageAlt || item.event?.title || "Puncak Travellers event",
    },
    tickets: getBookingTicketCount(item),
    total: typeof item.total === "number" ? formatCompactRupiah(item.total) : "Rp 0",
    status: displayBookingStatus(item.paymentStatus ?? item.status),
    date: formatBookingDate(item.date),
  };
}

export function mapApiBookingDetail(detail: ApiBookingDetail): BookingDetail {
  const tickets = Array.isArray(detail.tickets)
    ? detail.tickets.map((ticket) => ({
        qty: Number(ticket.quantity) || 1,
        type: ticket.name ?? "Ticket",
        price: ticket.price ?? 0,
      }))
    : [];

  const subtotal = detail.subtotal ?? tickets.reduce((acc, ticket) => acc + ticket.qty * ticket.price, 0);
  const bookingFee = detail.bookingFee ?? (subtotal > 0 ? 10000 : 0);

  return {
    reference: detail.reference || `REF-${detail.id}`,
    status: displayBookingStatus(detail.paymentStatus ?? detail.status),
    paymentStatus: detail.paymentStatus,
    date: formatBookingDate(detail.date),
    member: {
      name: detail.member?.name ?? detail.user?.name ?? detail.name ?? "Puncak Traveller",
      email: detail.member?.email ?? detail.user?.email ?? detail.email ?? "member@email.com",
      phone: detail.member?.phone ?? "",
      community: detail.member?.community ?? "Puncak Travellers",
    },
    event: {
      title: detail.event?.title ?? "Puncak Travellers event",
      date: detail.event?.date ?? "",
      location: detail.event?.location ?? "Puncak region",
    },
    tickets,
    subtotal,
    bookingFee,
    total: detail.total ?? subtotal + bookingFee,
    timeline: (detail.timeline ?? [{ title: "Booking confirmed", time: detail.date, type: "confirmed" }]).map((item) => ({
      title: item.title ?? "Booking updated",
      time: item.time ?? "",
      type: item.type,
    })),
  };
}

export async function getAdminBookingDetail(reference: string): Promise<BookingDetail> {
  const payload = await adminBookingRequest<ApiEnvelope<ApiBookingDetail>>(`/api/puncak/bookings/${encodeURIComponent(reference)}`);

  return mapApiBookingDetail(payload.data);
}

export async function resendBookingReceipt(reference: string): Promise<BookingActionResponse> {
  const payload = await adminBookingRequest<ApiEnvelope<BookingActionResponse>>(
    `/api/puncak/bookings/${encodeURIComponent(reference)}/resend-receipt`,
    { method: "POST" },
  );

  return payload.data;
}

export async function refundBooking(reference: string): Promise<BookingActionResponse> {
  const payload = await adminBookingRequest<ApiEnvelope<BookingActionResponse>>(
    `/api/puncak/bookings/${encodeURIComponent(reference)}/refund`,
    { method: "POST" },
  );

  return payload.data;
}

export async function updateBookingPaymentStatus(
  reference: string,
  status: AdminBookingStatus,
): Promise<BookingActionResponse> {
  const payload = await adminBookingRequest<ApiEnvelope<BookingActionResponse>>(
    `/api/puncak/bookings/${encodeURIComponent(reference)}/payment-status`,
    {
      body: JSON.stringify({ payment_status: paymentStatusForDisplay(status) }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
    },
  );

  return payload.data;
}

export async function refreshBookingPaymentStatus(reference: string): Promise<BookingActionResponse> {
  const payload = await adminBookingRequest<ApiEnvelope<BookingActionResponse>>(
    `/api/puncak/bookings/${encodeURIComponent(reference)}/payment-status/sync`,
    { method: "POST" },
  );

  return payload.data;
}

export async function downloadBookingTicket(reference: string): Promise<void> {
  const response = await fetch(`/api/puncak/bookings/${encodeURIComponent(reference)}/ticket`, {
    cache: "no-store",
    headers: { Accept: "text/html" },
  });

  if (!response.ok) {
    throw new Error(await errorMessageFromResponse(response, "Unable to download ticket."));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filenameFromDisposition(response.headers.get("Content-Disposition")) ?? `${reference}-ticket.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function displayBookingStatus(status?: string): AdminBookingStatus {
  if (status === "pending") {
    return "Pending";
  }

  if (status === "cancelled" || status === "failed") {
    return "Cancelled";
  }

  if (status === "refunded") {
    return "Refunded";
  }

  return "Paid";
}

export function paymentStatusForDisplay(status: AdminBookingStatus): string {
  if (status === "Pending") {
    return "pending";
  }

  if (status === "Cancelled") {
    return "failed";
  }

  if (status === "Refunded") {
    return "refunded";
  }

  return "paid";
}

export function formatBookingDate(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getBookingTicketCount(item: ApiBooking): number {
  if (typeof item.qty === "number" && item.qty > 0) {
    return item.qty;
  }

  if (typeof item.tickets === "number" && item.tickets > 0) {
    return item.tickets;
  }

  if (Array.isArray(item.tickets)) {
    const ticketCount = item.tickets.reduce<number>((sum, ticket) => {
      return sum + (Number(ticket.quantity) || 0);
    }, 0);

    return ticketCount || 1;
  }

  return 1;
}

function formatCompactRupiah(amount: number): string {
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}K`;
  }

  return formatRupiah(amount);
}

async function adminBookingRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  const response = await fetch(path, {
    cache: "no-store",
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await errorMessageFromResponse(response, "Unable to manage booking."));
  }

  return response.json() as Promise<T>;
}

async function errorMessageFromResponse(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = await response.json().catch(() => ({}));
    const errors = payload.errors ? Object.values(payload.errors).flat().join("; ") : "";

    return errors || payload.message || fallback;
  }

  return (await response.text().catch(() => "")) || fallback;
}

function filenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) {
    return null;
  }

  const match = disposition.match(/filename="?([^";]+)"?/i);

  return match?.[1] ?? null;
}

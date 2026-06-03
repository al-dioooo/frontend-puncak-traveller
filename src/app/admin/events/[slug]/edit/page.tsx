/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconClock,
  IconCalendar,
  IconPhoto,
  IconPlus,
  IconTrash,
  IconEye,
  IconLoader,
  IconAlertCircle,
  IconCheck,
  IconTicket,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { cn } from "@/lib/cn";

type TicketInputRow = {
  id: string;
  name: string;
  price: string;
  stock: string;
  sold: number;
};

type ApiEventDetail = {
  slug: string;
  title: string;
  category?: string;
  activity?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  location?: string;
  publicationStatus?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  organiser?: { name?: string };
  tickets?: Array<{
    id?: string;
    name: string;
    price: number;
    quantity?: number;
    stock?: number;
    sold?: number;
  }>;
};

type EditContext = {
  params: Promise<{ slug: string }>;
};

export default function AdminEditEventPage({ params }: EditContext) {
  const router = useRouter();
  const { slug } = use(params);
  const pageTitle = slug === "new" ? "Create Event" : "Edit Event";
  
  // Page core states
  const [title, setTitle] = useState("Puncak Trail Run 2026");
  const [urlSlug, setUrlSlug] = useState("puncak-trail-run-2026");
  const [community, setCommunity] = useState("Puncak Runners");
  const [activity, setActivity] = useState("Trail Run");
  const [description, setDescription] = useState(
    "A flagship sunrise trail run up Gunung Pangrango with 21K, 10K and 5K routes through tea plantations and montane forest. Eco race-pack, refreshments at every checkpoint, and a community brunch at the finish."
  );
  
  const [startsAt, setStartsAt] = useState("14 Jun 2026 · 06:00");
  const [endsAt, setEndsAt] = useState("14 Jun 2026 · 12:00");
  const [location, setLocation] = useState("Gunung Pangrango, Bogor");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("/events/puncak-trail-run-2026.jpg");
  const [coverPreviewObjectUrl, setCoverPreviewObjectUrl] = useState<string | null>(null);
  
  const [publishStatus, setPublishStatus] = useState<"Draft" | "Published" | "Archived">("Published");
  const [tickets, setTickets] = useState<TicketInputRow[]>([
    { id: "1", name: "21K Trail", price: "Rp 185.000", stock: "80", sold: 64 },
    { id: "2", name: "10K Run", price: "Rp 145.000", stock: "70", sold: 58 },
    { id: "3", name: "5K Fun", price: "Rp 95.000", stock: "50", sold: 36 },
  ]);

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  useEffect(() => {
    return () => {
      if (coverPreviewObjectUrl) {
        URL.revokeObjectURL(coverPreviewObjectUrl);
      }
    };
  }, [coverPreviewObjectUrl]);

  useEffect(() => {
    if (slug === "new") {
      setTitle("New event");
      setUrlSlug("new-event");
      setDescription("");
      setPublishStatus("Draft");
      setCoverImageFile(null);
      setCoverPreviewUrl("");
      setTickets([{ id: "general", name: "General Registration", price: "Rp 100.000", stock: "100", sold: 0 }]);
      return;
    }

    let active = true;

    async function loadEvent() {
      try {
        const response = await fetch(`/api/puncak/events/${encodeURIComponent(slug)}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("API load failed");
        }

        const payload = (await response.json()) as { data: ApiEventDetail };
        const detail = payload.data;

        if (!active) return;

        setTitle(detail.title);
        setUrlSlug(detail.slug);
        setCommunity(detail.organiser?.name || "Puncak Travellers");
        setActivity(detail.activity || detail.category || "trail-run");
        setDescription(detail.description || "");
        setStartsAt(formatDateForField(detail.startsAt));
        setEndsAt(formatDateForField(detail.endsAt));
        setLocation(detail.location || "Gunung Pangrango, Bogor");
        setPublishStatus(toDisplayPublicationStatus(detail.publicationStatus));
        setCoverImageFile(null);
        setCoverPreviewUrl(detail.imageUrl || "");

        if (detail.tickets && detail.tickets.length > 0) {
          setTickets(
            detail.tickets.map((t, idx) => ({
              id: t.id || String(idx),
              name: t.name,
              price: `Rp ${t.price.toLocaleString("id-ID")}`,
              stock: String(t.quantity ?? t.stock ?? 0),
              sold: t.sold ?? 0,
            }))
          );
        }

        return;
      } catch (error) {
        console.warn("Unable to load event from API:", error);
        triggerToast("Event details could not be loaded.");
      }
    }

    loadEvent();

    return () => {
      active = false;
    };
  }, [slug]);

  function handleAddTicket() {
    setTickets((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: "New Tier",
        price: "Rp 100.000",
        stock: "100",
        sold: 0,
      },
    ]);
  }

  function handleRemoveTicket(id: string) {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  }

  function handleTicketChange(id: string, field: keyof TicketInputRow, value: string) {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  async function handlePreview() {
    if (slug !== "new") {
      window.open(`/events/${urlSlug}?preview=true`, "_blank");
      return;
    }

    setSaving(true);

    const safeSlug = sanitizeSlug(urlSlug);

    const eventPayload = {
      title,
      slug: safeSlug,
      category: activityLabel(activity),
      activity: activityValue(activity),
      description,
      starts_at: toIsoDate(startsAt),
      ends_at: toIsoDate(endsAt),
      location,
      status: "draft",
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        name: ticket.name,
        price: numberFromCurrency(ticket.price),
        stock: numberFromCurrency(ticket.stock),
      })),
    };

    try {
      const requestBody = coverImageFile
        ? buildEventFormData(eventPayload, coverImageFile)
        : JSON.stringify(eventPayload);
      const requestHeaders = new Headers({ Accept: "application/json" });

      if (!coverImageFile) {
        requestHeaders.set("Content-Type", "application/json");
      }

      const response = await fetch("/api/puncak/events", {
        body: requestBody,
        headers: requestHeaders,
        method: "POST",
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (payload.errors) {
          console.warn("Validation errors:", payload.errors);
          const messages = Object.values(payload.errors).flat().join("; ");
          throw new Error(messages || payload.message || "Unable to save event.");
        }
        throw new Error(payload.message ?? "Unable to save event.");
      }

      setSaving(false);
      triggerToast("Draft saved. Opening preview...");
      setCoverImageFile(null);

      if (payload.data?.imageUrl) {
        setCoverPreviewUrl(payload.data.imageUrl);
        setCoverPreviewObjectUrl((previousUrl) => {
          if (previousUrl) URL.revokeObjectURL(previousUrl);
          return null;
        });
      }

      const newSlug = payload.data?.slug || urlSlug;
      window.open(`/events/${newSlug}?preview=true`, "_blank");

      if (payload.data?.slug) {
        router.replace(`/admin/events/${payload.data.slug}/edit`);
      }
    } catch (error) {
      setSaving(false);
      triggerToast(error instanceof Error ? error.message : "Unable to save event.");
    }
  }

  function sanitizeSlug(raw: string): string {
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/--+/g, "-");
  }

  function handleCoverFile(file: File) {
    if (!file.type.startsWith("image/")) {
      triggerToast("Cover image must be a JPG or PNG file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Cover image must be 5MB or smaller.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCoverImageFile(file);
    setCoverPreviewUrl(objectUrl);
    setCoverPreviewObjectUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      return objectUrl;
    });
  }

  function handleCoverInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      handleCoverFile(file);
    }
  }

  function handleCoverDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleCoverFile(file);
    }
  }

  async function handleSave(status?: "Draft" | "Published" | "Archived") {
    setSaving(true);
    if (status) {
      setPublishStatus(status);
    }

    const nextStatus = status ?? publishStatus;

    try {
      const safeSlug = sanitizeSlug(urlSlug);

      const eventPayload = {
        title,
        slug: safeSlug,
        category: activityLabel(activity),
        activity: activityValue(activity),
        description,
        starts_at: toIsoDate(startsAt),
        ends_at: toIsoDate(endsAt),
        location,
        status: nextStatus.toLowerCase(),
        tickets: tickets.map((ticket) => ({
          id: ticket.id,
          name: ticket.name,
          price: numberFromCurrency(ticket.price),
          stock: numberFromCurrency(ticket.stock),
        })),
      };
      const requestBody = coverImageFile
        ? buildEventFormData(eventPayload, coverImageFile, slug === "new" ? undefined : "PATCH")
        : JSON.stringify(eventPayload);
      const requestMethod = coverImageFile && slug !== "new" ? "POST" : slug === "new" ? "POST" : "PATCH";
      const requestHeaders = new Headers({ Accept: "application/json" });

      if (!coverImageFile) {
        requestHeaders.set("Content-Type", "application/json");
      }

      const response = await fetch(
        slug === "new"
          ? "/api/puncak/events"
          : `/api/puncak/events/${encodeURIComponent(slug)}`,
        {
          body: requestBody,
          headers: requestHeaders,
          method: requestMethod,
        }
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (payload.errors) {
          console.warn("Validation errors:", payload.errors);
          const messages = Object.values(payload.errors).flat().join("; ");
          throw new Error(messages || payload.message || "Unable to save event.");
        }
        throw new Error(payload.message ?? "Unable to save event.");
      }

      setSaving(false);
      triggerToast(status === "Draft" ? "Event saved as draft." : "Event changes published successfully.");
      setCoverImageFile(null);
      if (payload.data?.imageUrl) {
        setCoverPreviewUrl(payload.data.imageUrl);
        setCoverPreviewObjectUrl((previousUrl) => {
          if (previousUrl) {
            URL.revokeObjectURL(previousUrl);
          }

          return null;
        });
      }

      if (slug === "new" && payload.data?.slug) {
        router.replace(`/admin/events/${payload.data.slug}/edit`);
      }
    } catch (error) {
      setSaving(false);
      triggerToast(error instanceof Error ? error.message : "Unable to save event.");
    }
  }

  async function handleDeleteEvent() {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/puncak/events/${encodeURIComponent(slug)}`, {
          headers: { Accept: "application/json" },
          method: "DELETE",
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message ?? "Unable to delete event.");
        }

        triggerToast("Event deleted successfully.");
        setTimeout(() => {
          router.push("/admin/events");
        }, 1000);
      } catch (error) {
        triggerToast(error instanceof Error ? error.message : "Unable to delete event.");
      }
    }
  }

  return (
    <AdminLayout activeTab="Events" title={pageTitle}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <IconCheck className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editor Sub-header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/events"
            className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#F37820] hover:text-[#C24B00] transition"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to events</span>
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">
              {pageTitle}
            </h1>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                publishStatus === "Published"
                  ? "bg-teal-50 text-teal-700"
                  : publishStatus === "Draft"
                  ? "bg-slate-100 text-slate-600"
                  : "bg-red-50 text-red-700"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full mr-0.5", 
                publishStatus === "Published" ? "bg-teal-600" : publishStatus === "Draft" ? "bg-slate-400" : "bg-red-600"
              )} />
              {publishStatus}
            </span>
          </div>
        </div>

        {/* Global Save Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePreview}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 px-4 py-2 rounded-full text-[13px] font-bold shadow-sm transition disabled:opacity-50"
          >
            <IconEye className="w-4 h-4 text-slate-500" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={() => handleSave("Draft")}
            disabled={saving}
            className="flex-1 sm:flex-none bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 px-4 py-2 rounded-full text-[13px] font-bold shadow-sm transition disabled:opacity-50"
          >
            <span>Save draft</span>
          </button>

          <button
            onClick={() => handleSave("Published")}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#F37820] text-white hover:bg-[#C24B00] px-5 py-2.5 rounded-full text-[13px] font-bold shadow-sm shadow-orange-500/20 transition disabled:opacity-50 select-none motion-control"
          >
            {saving ? (
              <IconLoader className="w-4 h-4 animate-spin" />
            ) : (
              <IconCheck className="w-4 h-4" />
            )}
            <span>Publish changes</span>
          </button>
        </div>
      </div>

      {/* Main Form Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Span 2 main fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-[#0F172A]">
              <IconCalendar className="w-5 h-5 text-slate-400" />
              <h3 className="text-[16px] font-bold font-display">Event details</h3>
            </div>
            
            <div className="space-y-4">
              {/* Event title */}
              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="title">
                  Event title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                />
              </div>

              {/* URL Slug prefix */}
              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="slug">
                  URL slug
                </label>
                <div className="flex items-stretch border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8F7F5] focus-within:ring-1 focus-within:ring-[#F37820] focus-within:border-[#F37820] transition">
                  <span className="px-4 bg-slate-100/50 flex items-center text-[12.5px] text-[#647589] border-r border-[#E2E8F0] font-medium select-none">
                    puncaktravellers.id/events/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    value={urlSlug}
                    onChange={(e) => setUrlSlug(sanitizeSlug(e.target.value))}
                    className="flex-1 bg-transparent px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none border-0"
                  />
                </div>
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-bold text-[#334155]">Community</label>
                  <select
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  >
                    <option value="Puncak Runners">Puncak Runners</option>
                    <option value="Puncak Walkers">Puncak Walkers</option>
                    <option value="Puncak Campers">Puncak Campers</option>
                    <option value="Puncak Travellers">Puncak Travellers</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-bold text-[#334155]">Activity type</label>
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  >
                    <option value="Trail Run">Trail Run</option>
                    <option value="Walk">Walk</option>
                    <option value="Camping">Camping</option>
                    <option value="Hike">Hike</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Fun Run">Fun Run</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="desc">
                  Description
                </label>
                <textarea
                  id="desc"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition font-sans"
                />
              </div>
            </div>
          </div>

          {/* Schedule card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-[#0F172A]">
              <IconClock className="w-5 h-5 text-slate-400" />
              <h3 className="text-[16px] font-bold font-display">Schedule & location</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="starts">
                    Starts at
                  </label>
                  <input
                    id="starts"
                    type="text"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="ends">
                    Ends at
                  </label>
                  <input
                    id="ends"
                    type="text"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]">Place</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                >
                  <option value="Gunung Pangrango, Bogor">Gunung Pangrango, Bogor</option>
                  <option value="Kebun Raya Cibodas">Kebun Raya Cibodas</option>
                  <option value="Ranca Upas, Ciwidey">Ranca Upas, Ciwidey</option>
                  <option value="Taman Hutan Raya, Bandung">Taman Hutan Raya, Bandung</option>
                  <option value="Gunung Papandayan">Gunung Papandayan</option>
                </select>
              </div>

              {/* Status note */}
              <div className="flex items-start gap-2 bg-[#F8F7F5] border border-[#E2E8F0] p-4 rounded-xl text-xs text-[#647589]">
                <IconAlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>
                  Status is derived automatically — currently{" "}
                  <strong className="text-[#0F172A]">Upcoming</strong> (starts in 11 days).
                </span>
              </div>
            </div>
          </div>

          {/* Cover image card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-[#0F172A]">
              <IconPhoto className="w-5 h-5 text-slate-400" />
              <h3 className="text-[16px] font-bold font-display">Cover image</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-slate-100 rounded-xl border border-[#E2E8F0] flex items-center justify-center font-bold text-slate-400 text-xs uppercase overflow-hidden">
                {coverPreviewUrl ? (
                  <div
                    role="img"
                    aria-label={`${title || "Event"} cover preview`}
                    className="h-full w-full object-cover"
                    style={{ background: `center / cover no-repeat url("${coverPreviewUrl}")` }}
                  />
                ) : (
                  "Image Preview"
                )}
              </div>
              <label
                htmlFor="cover-image"
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleCoverDrop}
                className="flex-1 border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8F7F5] flex flex-col justify-center items-center p-6 text-center cursor-pointer hover:bg-slate-50 transition"
              >
                <input
                  id="cover-image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleCoverInputChange}
                  className="sr-only"
                />
                <IconPhoto className="w-7 h-7 text-[#647589] mb-2" />
                <div className="text-[12.5px] font-bold text-[#0F172A]">
                  Drop a new image or <span className="text-[#F37820] hover:underline">browse</span>
                </div>
                <div className="text-[11px] text-[#647589] mt-1">
                  JPG or PNG · 16:10 · up to 5MB
                </div>
                {coverImageFile ? (
                  <div className="mt-2 text-[11px] font-bold text-[#0D9488]">
                    {coverImageFile.name}
                  </div>
                ) : null}
              </label>
            </div>
          </div>

          {/* Ticket types card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-2 text-[#0F172A]">
                <IconTicket className="w-5 h-5 text-slate-400" />
                <h3 className="text-[16px] font-bold font-display">Ticket types</h3>
              </div>
              <button
                onClick={handleAddTicket}
                className="flex items-center gap-1 bg-slate-50 border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold transition select-none"
              >
                <IconPlus className="w-3.5 h-3.5" />
                <span>Add type</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-[#647589] uppercase tracking-wider px-3 select-none">
                <div className="col-span-5">Name</div>
                <div className="col-span-3">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-1 text-center">Sold</div>
                <div className="col-span-1 text-right"></div>
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-12 gap-3 items-center bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl p-2"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => handleTicketChange(t.id, "name", e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={t.price}
                        onChange={(e) => handleTicketChange(t.id, "price", e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] outline-none"
                      />
                    </div>
                    <div className="col-span-2 text-center">
                      <input
                        type="text"
                        value={t.stock}
                        onChange={(e) => handleTicketChange(t.id, "stock", e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] text-center outline-none"
                      />
                    </div>
                    <div className="col-span-1 text-center text-xs font-bold text-[#647589] select-none">
                      {t.sold}
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => handleRemoveTicket(t.id)}
                        disabled={tickets.length <= 1}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove tier"
                      >
                        <IconTrash className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning note */}
              <div className="flex items-start gap-2 text-[11px] text-[#647589] pt-2 select-none">
                <IconAlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  Sold counts are read-only — they update from confirmed bookings and protect against overselling.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Span 1 side panel */}
        <div className="space-y-6">
          {/* Publish status selection */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-2 font-display select-none">
              Publish status
            </h3>
            
            <div className="space-y-2">
              {[
                { name: "Draft", desc: "Only admins can see this" },
                { name: "Published", desc: "Live on the website" },
                { name: "Archived", desc: "Hidden, kept for records" },
              ].map((opt) => {
                const isSel = publishStatus === opt.name;
                
                return (
                  <div
                    key={opt.name}
                    onClick={() => setPublishStatus(opt.name as "Draft" | "Published" | "Archived")}
                    className={cn(
                      "flex gap-3.5 items-start p-3 border rounded-xl cursor-pointer transition select-none",
                      isSel
                        ? "bg-[#F8F7F5] border-[#F37820]"
                        : "bg-white border-[#E2E8F0] hover:bg-slate-50"
                    )}
                  >
                    <span className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center mt-0.5",
                      isSel ? "border-[#F37820]" : "border-slate-300"
                    )}>
                      {isSel && <span className="w-2.5 h-2.5 bg-[#F37820] rounded-full" />}
                    </span>
                    <div className="leading-tight">
                      <div className="text-[13px] font-bold text-[#0F172A]">
                        {opt.name}
                      </div>
                      <div className="text-[11px] text-[#647589] mt-0.5">
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Organizing community */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-2 font-display select-none">
              Organising community
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm uppercase border border-[#E2E8F0]">
                  PR
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-[#0F172A]">
                    {community}
                  </div>
                  <div className="text-[11px] text-[#647589] mt-0.5">
                    Sub-community of Puncak Travellers
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="text-[12.5px] space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[#647589] font-medium">Created by</span>
                  <span className="font-semibold text-[#0F172A]">Sari Dewi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647589] font-medium">Last updated</span>
                  <span className="font-semibold text-[#0F172A]">2 Jun 2026, 14:20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-[15px] font-bold text-red-600 border-b border-red-50 pb-2 font-display select-none">
              Danger zone
            </h3>
            <p className="text-[11.5px] text-[#647589] font-medium leading-relaxed select-none">
              Deleting an event removes its tickets and gallery links. Bookings are kept for records.
            </p>
            <button
              onClick={handleDeleteEvent}
              className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2 rounded-full text-xs font-bold transition select-none flex items-center justify-center gap-1.5 motion-control"
            >
              <IconTrash className="w-4 h-4" />
              <span>Delete event</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function formatDateForField(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toIsoDate(value: string): string {
  const normalized = value.replace("·", " ");
  const parsed = new Date(normalized);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return new Date().toISOString();
}

function numberFromCurrency(value: string): number {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

type EventPayload = {
  title: string;
  slug: string;
  category: string;
  activity: string;
  description: string;
  starts_at: string;
  ends_at: string;
  location: string;
  status: string;
  tickets: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;
};

function buildEventFormData(payload: EventPayload, image: File, method?: "PATCH"): FormData {
  const formData = new FormData();

  if (method) {
    formData.set("_method", method);
  }

  formData.set("title", payload.title);
  formData.set("slug", payload.slug);
  formData.set("category", payload.category);
  formData.set("activity", payload.activity);
  formData.set("description", payload.description);
  formData.set("starts_at", payload.starts_at);
  formData.set("ends_at", payload.ends_at);
  formData.set("location", payload.location);
  formData.set("status", payload.status);
  formData.set("image", image);

  payload.tickets.forEach((ticket, index) => {
    formData.set(`tickets[${index}][id]`, ticket.id);
    formData.set(`tickets[${index}][name]`, ticket.name);
    formData.set(`tickets[${index}][price]`, String(ticket.price));
    formData.set(`tickets[${index}][stock]`, String(ticket.stock));
  });

  return formData;
}

function activityValue(value: string): string {
  const normalized = value.toLowerCase().replace(/\s+/g, "-");

  return normalized === "trail-run" ||
    normalized === "walk" ||
    normalized === "camping" ||
    normalized === "hike" ||
    normalized === "wellness" ||
    normalized === "fun-run"
    ? normalized
    : "hike";
}

function activityLabel(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function toDisplayPublicationStatus(value?: string): "Draft" | "Published" | "Archived" {
  if (value === "draft") {
    return "Draft";
  }

  if (value === "archived") {
    return "Archived";
  }

  return "Published";
}

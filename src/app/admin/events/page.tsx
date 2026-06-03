"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconSearch,
  IconDownload,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { cn } from "@/lib/cn";
import { shouldBypassImageOptimization } from "@/lib/image-optimization";

interface ApiEvent {
  slug: string;
  title: string;
  category?: string;
  organiser?: { name: string };
  dateLabel?: string;
  status?: "upcoming" | "ongoing" | "completed" | "draft";
  statusLabel?: string;
  participant_count?: number;
  tickets?: Array<{ stock?: number }>;
  priceLabel?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
}

type EventRow = {
  slug: string;
  title: string;
  category: string;
  community: string;
  date: string;
  status: "upcoming" | "ongoing" | "completed" | "draft";
  statusLabel: string;
  sold: number;
  capacity: number;
  priceLabel: string;
  imageUrl: string;
  imageAlt: string;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const selectedFilter: string = "All";
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Event Management";
  }, []);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/puncak/events?per_page=15&page=${page}`, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("API load failed");

        const payload = await response.json();
        const apiRows = Array.isArray(payload.data) ? payload.data.map((item: ApiEvent) => ({
          slug: item.slug,
          title: item.title,
          category: item.category || "Adventure",
          community: item.organiser?.name || "Puncak Travellers",
          date: item.dateLabel || "Not scheduled",
          status: item.status || "upcoming",
          statusLabel: item.statusLabel || "Upcoming",
          sold: item.participant_count || 0,
          capacity: item.tickets?.reduce((acc: number, t: { stock?: number }) => acc + (t.stock || 0), 0) || 0,
          priceLabel: item.priceLabel || "Free",
          imageUrl: item.imageUrl || "",
          imageAlt: item.imageAlt || item.title,
        })) : [];
        setEvents(apiRows);
        setTotal(payload.meta?.total ?? apiRows.length);
      } catch (err) {
        console.warn("Unable to load events from API:", err);
        setEvents([]);
        setTotal(0);
        setError("Events could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [page]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesStatus =
        selectedFilter === "All" ||
        (selectedFilter === "Upcoming" && e.status === "upcoming") ||
        (selectedFilter === "Ongoing" && e.status === "ongoing") ||
        (selectedFilter === "Past" && e.status === "completed") ||
        (selectedFilter === "Drafts" && e.status === "draft");

      const query = searchQuery.toLowerCase();
      const matchesQuery =
        e.title.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        e.community.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [events, selectedFilter, searchQuery]);

  const toggleSelectAll = () => {
    if (Object.keys(selectedRows).length === filteredEvents.length) {
      setSelectedRows({});
    } else {
      const all: Record<string, boolean> = {};
      filteredEvents.forEach((e) => (all[e.slug] = true));
      setSelectedRows(all);
    }
  };

  const toggleSelectRow = (slug: string) => {
    setSelectedRows((prev) => {
      const copy = { ...prev };
      if (copy[slug]) {
        delete copy[slug];
      } else {
        copy[slug] = true;
      }
      return copy;
    });
  };

  async function handleDelete(slug: string, e: React.MouseEvent) {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/puncak/events/${encodeURIComponent(slug)}`, {
        headers: { Accept: "application/json" },
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message ?? "Unable to delete event.");
      }

      setEvents((prev) => prev.filter((item) => item.slug !== slug));
      setToastMessage("Event deleted successfully.");
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : "Unable to delete event.");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  }

  function handleExport() {
    setToastMessage("Event catalog exported.");
    setTimeout(() => setToastMessage(null), 3000);
  }

  return (
    <AdminLayout activeTab="Events" title="Event Management">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <IconCheck className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page head */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">
            Event Management
          </h1>
          <p className="text-[#647589] text-[14px] mt-1 font-medium">
            {events.length} events across 6 communities · manage details, schedule & ticket inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 px-4 py-2 rounded-full text-[13px] font-bold shadow-sm transition motion-control"
          >
            <IconDownload className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>
          <Link
            href="/admin/events/new"
            className="flex items-center gap-2 bg-[#F37820] !text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-sm shadow-orange-500/20 hover:bg-[#C24B00] transition motion-control"
          >
            <IconPlus className="w-4 h-4 text-white" />
            <span>New event</span>
          </Link>
        </div>
      </div>

      {/* Toolbar Filter Section */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm">
        {/* Left option chips */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search bar */}
          <div className="relative w-64 mr-2">
            <IconSearch className="w-4 h-4 text-[#647589] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-full py-1.5 pl-9 pr-4 text-[12.5px] text-[#0F172A] placeholder-[#647589] focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] outline-none transition"
            />
          </div>

          {/* Filter chips intentionally hidden per CMS revision request.
          {["All", "Upcoming", "Ongoing", "Past", "Drafts"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[12.5px] font-bold border transition",
                selectedFilter === filter
                  ? "bg-[#F37820]/10 border-[#F37820] text-[#C24B00]"
                  : "bg-white border-[#E2E8F0] text-[#647589] hover:bg-slate-50"
              )}
            >
              {filter}
            </button>
          ))}
          */}
        </div>

        {/* Filter/sort controls intentionally hidden per CMS revision request.
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] px-3.5 py-1.5 rounded-full text-[12.5px] font-bold text-[#0F172A] cursor-pointer shadow-sm hover:bg-slate-50 transition select-none">
            <span>All communities</span>
            <IconChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] px-3.5 py-1.5 rounded-full text-[12.5px] font-bold text-[#0F172A] cursor-pointer shadow-sm hover:bg-slate-50 transition select-none">
            <IconSelector className="w-4 h-4 text-slate-400" />
            <span>Sort: Date</span>
          </div>
        </div>
        */}
      </div>

      {error ? (
        <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-5 text-sm font-bold">
          {error}
        </div>
      ) : null}

      {/* Main Table Grid Panel */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F7F5] border-b border-[#E2E8F0]">
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredEvents.length > 0 &&
                      Object.keys(selectedRows).length === filteredEvents.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-[#E2E8F0] text-[#F37820] focus:ring-[#F37820] cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Event
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Community
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Date
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Tickets sold
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Price
                </th>
                <th className="px-6 py-4 w-28"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    Loading events...
                  </td>
                </tr>
              ) : filteredEvents.map((e) => {
                const percentage = e.capacity > 0 ? Math.round((e.sold / e.capacity) * 100) : 0;
                
                return (
                  <tr
                    key={e.slug}
                    className="hover:bg-[#F8F7F5] transition duration-150"
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={!!selectedRows[e.slug]}
                        onChange={() => toggleSelectRow(e.slug)}
                        className="rounded border-[#E2E8F0] text-[#F37820] focus:ring-[#F37820] cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-400 uppercase">
                          {e.imageUrl ? (
                            <Image
                              src={e.imageUrl}
                              alt={e.imageAlt}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized={shouldBypassImageOptimization(e.imageUrl)}
                            />
                          ) : (
                            e.category.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <span className="text-[13.5px] font-bold text-[#0F172A] block leading-tight">
                            {e.title}
                          </span>
                          <span className="text-[11px] text-[#647589] font-medium mt-1 inline-block">
                            {e.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13.5px] text-[#0F172A] font-semibold">
                      {e.community}
                    </td>
                    <td className="px-6 py-4 text-[13.5px] text-[#647589] font-medium whitespace-nowrap">
                      {e.date}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                          e.status === "upcoming"
                            ? "bg-orange-50 text-orange-700"
                            : e.status === "ongoing"
                            ? "bg-teal-50 text-teal-700"
                            : e.status === "completed"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-slate-100 text-[#647589]"
                        )}
                      >
                        {e.status === "ongoing" && (
                          <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-ping" />
                        )}
                        {e.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {e.status === "draft" ? (
                        <span className="text-[12.5px] text-[#94A3B8] font-medium">
                          — not on sale
                        </span>
                      ) : (
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-[#0F172A] font-bold">
                              {e.sold}{" "}
                              <span className="text-[#647589] font-medium">/ {e.capacity}</span>
                            </span>
                            <span className="text-[#F37820]">{percentage}%</span>
                          </div>
                          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#F37820] h-full rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[13.5px] font-bold text-[#0F172A]">
                      {e.priceLabel}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/events/${e.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-[#647589] hover:bg-slate-100 hover:text-slate-800 transition"
                          title="View public details"
                        >
                          <IconEye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/events/${e.slug}/edit`}
                          className="p-1.5 rounded-lg text-[#647589] hover:bg-slate-100 hover:text-slate-800 transition"
                          title="Edit event"
                        >
                          <IconEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={(event) => handleDelete(e.slug, event)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete event"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    No events available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-[#E2E8F0] bg-white">
          <span className="text-[12.5px] text-[#647589] font-medium">
            Showing {filteredEvents.length === 0 ? 0 : (page - 1) * 15 + 1}–{(page - 1) * 15 + filteredEvents.length} of {total} events
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="p-1.5 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#F37820]/15 text-[#C24B00] border border-[#F37820]/15 text-xs font-bold transition">
              {page}
            </button>
            <button
              disabled={page * 15 >= total}
              onClick={() => setPage((value) => value + 1)}
              className="p-1.5 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
            >
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

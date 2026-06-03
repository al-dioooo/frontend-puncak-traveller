"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";

interface ApiPlace {
  id: number;
  name: string;
  community_id?: number;
  lat?: number | string;
  lng?: number | string;
  description?: string;
}

type PlaceRow = {
  id: number;
  name: string;
  communityId: number | string;
  lat: string;
  lng: string;
  description: string;
};

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Place Management";
  }, []);

  useEffect(() => {
    async function loadPlaces() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/puncak/places?per_page=15&page=${page}`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("API load failed");
        const payload = await response.json();
        const rows = Array.isArray(payload.data)
          ? payload.data.map((item: ApiPlace) => ({
              id: item.id,
              name: item.name,
              communityId: item.community_id ?? "—",
              lat: item.lat != null ? String(item.lat) : "—",
              lng: item.lng != null ? String(item.lng) : "—",
              description: item.description || "—",
            }))
          : [];
        setPlaces(rows);
        setTotal(payload.meta?.total ?? rows.length);
      } catch (err) {
        console.warn("Unable to load places from API:", err);
        setPlaces([]);
        setTotal(0);
        setError("Places could not be loaded.");
      } finally {
        setLoading(false);
      }
    }
    loadPlaces();
  }, [page]);

  const filteredPlaces = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        String(p.communityId).toLowerCase().includes(query)
    );
  }, [places, searchQuery]);

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/puncak/places/${id}`, {
        headers: { Accept: "application/json" },
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message ?? "Unable to delete place.");
      }
      setPlaces((prev) => prev.filter((item) => item.id !== id));
      setToastMessage("Place deleted successfully.");
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Unable to delete place.");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  }

  return (
    <AdminLayout activeTab="Places" title="Place Management">
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
            Place Management
          </h1>
          <p className="text-[#647589] text-[14px] mt-1 font-medium">
            {places.length} places · manage event venues and route locations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/places/new"
            className="flex items-center gap-2 bg-[#F37820] !text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-sm shadow-orange-500/20 hover:bg-[#C24B00] transition"
          >
            <IconPlus className="w-4 h-4 text-white" />
            <span>New place</span>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm">
        <div className="relative w-64">
          <IconSearch className="w-4 h-4 text-[#647589] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search places…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-full py-1.5 pl-9 pr-4 text-[12.5px] text-[#0F172A] placeholder-[#647589] focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] outline-none transition"
          />
        </div>
      </div>

      {error ? (
        <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-5 text-sm font-bold">
          {error}
        </div>
      ) : null}

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F7F5] border-b border-[#E2E8F0]">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Place
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Community
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Coordinates
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Description
                </th>
                <th className="px-6 py-4 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    Loading places...
                  </td>
                </tr>
              ) : (
                filteredPlaces.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F7F5] transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] flex-shrink-0 flex items-center justify-center">
                          <IconMapPin className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <span className="text-[13.5px] font-bold text-[#0F172A] block leading-tight">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-[#647589] font-medium">
                            ID #{p.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13.5px] text-[#0F172A] font-semibold">
                      {p.communityId}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#647589] font-medium whitespace-nowrap">
                      {p.lat !== "—" && p.lng !== "—" ? `${p.lat}, ${p.lng}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#647589] font-medium max-w-xs truncate">
                      {p.description}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/places/${p.id}/edit`}
                          className="p-1.5 rounded-lg text-[#647589] hover:bg-slate-100 hover:text-slate-800 transition"
                          title="Edit place"
                        >
                          <IconEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={(event) => handleDelete(p.id, event)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete place"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredPlaces.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    No places available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-6 py-4 border-t border-[#E2E8F0] bg-white">
          <span className="text-[12.5px] text-[#647589] font-medium">
            Showing {filteredPlaces.length === 0 ? 0 : (page - 1) * 15 + 1}–
            {(page - 1) * 15 + filteredPlaces.length} of {total} places
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((v) => Math.max(1, v - 1))}
              className="p-1.5 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#F37820]/15 text-[#C24B00] border border-[#F37820]/15 text-xs font-bold transition">
              {page}
            </button>
            <button
              disabled={page * 15 >= total}
              onClick={() => setPage((v) => v + 1)}
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

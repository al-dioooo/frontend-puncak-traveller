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
  IconUserCheck,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { cn } from "@/lib/cn";

interface ApiMember {
  id: number;
  name: string;
  email: string;
  role?: "member" | "admin";
  status?: "active" | "inactive";
  location?: string;
  crew?: string;
}

type MemberRow = {
  id: number;
  name: string;
  email: string;
  role: "member" | "admin";
  status: "active" | "inactive";
  location: string;
  crew: string;
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Member Management";
  }, []);

  useEffect(() => {
    async function loadMembers() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/puncak/members?per_page=15&page=${page}`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("API load failed");
        const payload = await response.json();
        const rows = Array.isArray(payload.data)
          ? payload.data.map((item: ApiMember) => ({
              id: item.id,
              name: item.name,
              email: item.email,
              role: item.role ?? "member",
              status: item.status ?? "active",
              location: item.location || "—",
              crew: item.crew || "—",
            }))
          : [];
        setMembers(rows);
        setTotal(payload.meta?.total ?? rows.length);
      } catch (err) {
        console.warn("Unable to load members from API:", err);
        setMembers([]);
        setTotal(0);
        setError("Members could not be loaded.");
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [page]);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/puncak/members/${id}`, {
        headers: { Accept: "application/json" },
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message ?? "Unable to delete member.");
      }
      setMembers((prev) => prev.filter((item) => item.id !== id));
      setToastMessage("Member deleted successfully.");
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Unable to delete member.");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  }

  return (
    <AdminLayout activeTab="Members" title="Member Management">
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
            Member Management
          </h1>
          <p className="text-[#647589] text-[14px] mt-1 font-medium">
            {members.length} members · manage accounts, access roles, and account status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/members/new"
            className="flex items-center gap-2 bg-[#F37820] text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-sm shadow-orange-500/20 hover:bg-[#C24B00] transition"
          >
            <IconPlus className="w-4 h-4" />
            <span>New member</span>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm">
        <div className="relative w-64">
          <IconSearch className="w-4 h-4 text-[#647589] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search members…"
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
                  Member
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Role
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Location
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                  Crew
                </th>
                <th className="px-6 py-4 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    Loading members...
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F8F7F5] transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#F1F5F9] rounded-full border border-[#E2E8F0] flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-500 uppercase">
                          {m.name.slice(0, 2)}
                        </div>
                        <div>
                          <span className="text-[13.5px] font-bold text-[#0F172A] block leading-tight">
                            {m.name}
                          </span>
                          <span className="text-[11px] text-[#647589] font-medium">
                            {m.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                          m.role === "admin"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {m.role === "admin" ? "Admin" : "Member"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                          m.status === "active"
                            ? "bg-teal-50 text-teal-700"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {m.status === "active" && (
                          <span className="w-1.5 h-1.5 bg-teal-600 rounded-full" />
                        )}
                        {m.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#647589] font-medium">
                      {m.location}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#647589] font-medium">
                      {m.crew}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/members/${m.id}/edit`}
                          className="p-1.5 rounded-lg text-[#647589] hover:bg-slate-100 hover:text-slate-800 transition"
                          title="Edit member"
                        >
                          <IconEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={(event) => handleDelete(m.id, event)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete member"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    No members available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-6 py-4 border-t border-[#E2E8F0] bg-white">
          <span className="text-[12.5px] text-[#647589] font-medium">
            Showing {filteredMembers.length === 0 ? 0 : (page - 1) * 15 + 1}–
            {(page - 1) * 15 + filteredMembers.length} of {total} members
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

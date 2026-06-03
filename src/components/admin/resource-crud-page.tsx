"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { IconCheck, IconChevronLeft, IconChevronRight, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";

type Field = {
  key: string;
  label: string;
  type?: "email" | "number" | "password" | "select" | "textarea" | "text";
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
};

type ResourceItem = Record<string, string | number | null | undefined>;

type AdminResourceCrudPageProps = {
  activeTab: string;
  endpoint: string;
  fields: Field[];
  keyField: string;
  subtitle: string;
  title: string;
};

export function AdminResourceCrudPage({
  activeTab,
  endpoint,
  fields,
  keyField,
  subtitle,
  title,
}: AdminResourceCrudPageProps) {
  const emptyForm = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.key, ""])) as Record<string, string>,
    [fields],
  );
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [editingKey, setEditingKey] = useState<string | number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, endpoint]);

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/puncak/${endpoint}?per_page=15&page=${page}`, {
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? `${title} could not be loaded.`);
      }

      setItems(Array.isArray(payload.data) ? payload.data : []);
      setTotal(payload.meta?.total ?? payload.meta?.totalItems ?? payload.data?.length ?? 0);
    } catch (loadError) {
      setItems([]);
      setTotal(0);
      setError(loadError instanceof Error ? loadError.message : `${title} could not be loaded.`);
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, normalizeValue(value)]),
    );
    const target = editingKey === null ? endpoint : `${endpoint}/${encodeURIComponent(String(editingKey))}`;

    try {
      const response = await fetch(`/api/puncak/${target}`, {
        body: JSON.stringify(payload),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: editingKey === null ? "POST" : "PATCH",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message ?? `Unable to save ${title.toLowerCase()}.`);
      }

      setForm(emptyForm);
      setEditingKey(null);
      setMessage(`${title.slice(0, -1)} saved successfully.`);
      await loadItems();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : `Unable to save ${title.toLowerCase()}.`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  async function remove(item: ResourceItem) {
    const itemKey = item[keyField];
    if (!itemKey) return;

    try {
      const response = await fetch(`/api/puncak/${endpoint}/${encodeURIComponent(String(itemKey))}`, {
        headers: { Accept: "application/json" },
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? `Unable to delete ${title.toLowerCase()}.`);
      }

      setMessage(`${title.slice(0, -1)} deleted successfully.`);
      await loadItems();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : `Unable to delete ${title.toLowerCase()}.`);
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  }

  function edit(item: ResourceItem) {
    setEditingKey(item[keyField] ?? null);
    setForm(
      Object.fromEntries(
        fields.map((field) => [field.key, String(item[field.key] ?? "")]),
      ) as Record<string, string>,
    );
  }

  return (
    <AdminLayout activeTab={activeTab} title={title}>
      {message ? (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50">
          <IconCheck className="w-4 h-4 text-teal-400" />
          <span>{message}</span>
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row justify-between items-start gap-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">
            {title}
          </h1>
          <p className="text-[#647589] text-[14px] mt-1 font-medium">{subtitle}</p>
        </div>
      </div>

      {error ? (
        <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-5 text-sm font-bold">
          {error}
        </div>
      ) : null}

      <form onSubmit={submit} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5 grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <label key={field.key} className="grid gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#647589]">
              {field.label}
              {field.type === "textarea" ? (
                <textarea
                  value={form[field.key] ?? ""}
                  required={field.required}
                  onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                  className="min-h-24 rounded-xl border border-[#E2E8F0] px-3 py-2 text-[14px] normal-case tracking-normal text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820]"
                />
              ) : field.type === "select" ? (
                <select
                  value={form[field.key] ?? ""}
                  required={field.required}
                  onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                  className="rounded-xl border border-[#E2E8F0] px-3 py-2 text-[14px] normal-case tracking-normal text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820]"
                >
                  <option value="">Select</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type ?? "text"}
                  value={form[field.key] ?? ""}
                  required={field.required}
                  onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                  className="rounded-xl border border-[#E2E8F0] px-3 py-2 text-[14px] normal-case tracking-normal text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820]"
                />
              )}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#F37820] text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-sm shadow-orange-500/20 hover:bg-[#C24B00] transition disabled:opacity-50"
          >
            <IconPlus className="w-4 h-4" />
            {saving ? "Saving..." : editingKey === null ? `Create ${title.slice(0, -1)}` : `Update ${title.slice(0, -1)}`}
          </button>
          {editingKey !== null ? (
            <button
              type="button"
              onClick={() => {
                setEditingKey(null);
                setForm(emptyForm);
              }}
              className="bg-white border border-[#E2E8F0] text-[#0F172A] px-4 py-2 rounded-full text-[13px] font-bold"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F7F5] border-b border-[#E2E8F0]">
                {fields.slice(0, 4).map((field) => (
                  <th key={field.key} className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#647589]">
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-4 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={fields.slice(0, 4).length + 1} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    Loading {title.toLowerCase()}...
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={String(item[keyField])} className="hover:bg-[#F8F7F5] transition">
                    {fields.slice(0, 4).map((field) => (
                      <td key={field.key} className="px-6 py-4 text-[13.5px] text-[#0F172A] font-semibold">
                        {String(item[field.key] ?? "-")}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => edit(item)}
                          className="p-1.5 rounded-lg text-[#647589] hover:bg-slate-100 hover:text-slate-800 transition"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={fields.slice(0, 4).length + 1} className="px-6 py-12 text-center text-[#647589] text-[14px]">
                    No {title.toLowerCase()} available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-6 py-4 border-t border-[#E2E8F0] bg-white">
          <span className="text-[12.5px] text-[#647589] font-medium">
            Showing {items.length === 0 ? 0 : (page - 1) * 15 + 1}–{(page - 1) * 15 + items.length} of {total} {title.toLowerCase()}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="p-1.5 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
            >
              <IconChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-8 h-8 rounded-lg bg-[#F37820]/15 text-[#C24B00] border border-[#F37820]/15 text-xs font-bold inline-flex items-center justify-center">
              {page}
            </span>
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

function normalizeValue(value: string) {
  if (value === "") {
    return null;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
}

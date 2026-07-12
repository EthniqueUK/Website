"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  deleteCategoryAction,
  deleteTagAction,
  setCategoryActiveAction,
  setTagActiveAction,
  upsertCategoryAction,
  upsertTagAction,
} from "@/lib/actions/category-actions";
import type { CategoryRow, TagRow } from "@/lib/catalog/queries";

type TaxonomyManagerProps = {
  categories: CategoryRow[];
  tags: TagRow[];
};

export function TaxonomyManager({ categories, tags }: TaxonomyManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      setMessage(success);
      router.refresh();
    });
  }

  function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    run(() => upsertCategoryAction(formData), "Category saved.");
    event.currentTarget.reset();
  }

  function handleTagSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    run(() => upsertTagAction(formData), "Tag saved.");
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
          Garment categories
        </h2>
        <p className="mt-1 text-sm text-[#A79C89]">
          Flat list only — Kurta, Lehenga, Saree, and so on. No nesting.
        </p>

        <form onSubmit={handleCategorySubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input
            name="name"
            required
            placeholder="Name"
            className="rounded-xl border border-[#A79C89]/40 px-3 py-2.5 text-sm sm:col-span-1"
          />
          <input
            name="slug"
            placeholder="Slug (optional)"
            className="rounded-xl border border-[#A79C89]/40 px-3 py-2.5 text-sm"
          />
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            placeholder="Sort"
            className="rounded-xl border border-[#A79C89]/40 px-3 py-2.5 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-[#1F1F1F]">
            <input name="is_active" type="checkbox" defaultChecked value="1" />
            Active
          </label>
          <input
            name="description"
            placeholder="Description (optional)"
            className="rounded-xl border border-[#A79C89]/40 px-3 py-2.5 text-sm sm:col-span-3"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[#3B0F14] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            Add category
          </button>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-[#A79C89]/30 text-xs uppercase tracking-wide text-[#A79C89]">
              <tr>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Slug</th>
                <th className="py-2 pr-3">Sort</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-[#A79C89]/15 align-top">
                  <td className="py-3 pr-3 text-[#3B0F14]">{category.name}</td>
                  <td className="py-3 pr-3 text-[#1F1F1F]">{category.slug}</td>
                  <td className="py-3 pr-3 text-[#1F1F1F]">{category.sort_order}</td>
                  <td className="py-3 pr-3">
                    {category.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          run(
                            () => setCategoryActiveAction(category.id, !category.is_active),
                            category.is_active
                              ? "Category deactivated."
                              : "Category activated.",
                          )
                        }
                        className="text-xs font-semibold text-[#3B0F14] underline disabled:opacity-60"
                      >
                        {category.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          run(() => deleteCategoryAction(category.id), "Category deleted.")
                        }
                        className="text-xs font-semibold text-red-700 underline disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#A79C89]">
                    No categories yet. Run the catalog taxonomy migration to seed defaults.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
          Marketing tags
        </h2>
        <p className="mt-1 text-sm text-[#A79C89]">
          New Arrivals, Trending, Offers — cross-cutting labels, not categories.
        </p>

        <form onSubmit={handleTagSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input
            name="name"
            required
            placeholder="Name"
            className="rounded-xl border border-[#A79C89]/40 px-3 py-2.5 text-sm"
          />
          <input
            name="slug"
            placeholder="Slug (optional)"
            className="rounded-xl border border-[#A79C89]/40 px-3 py-2.5 text-sm"
          />
          <select
            name="kind"
            defaultValue="marketing"
            className="rounded-xl border border-[#A79C89]/40 bg-white px-3 py-2.5 text-sm"
          >
            <option value="marketing">Marketing</option>
            <option value="collection">Collection</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-[#1F1F1F]">
            <input name="is_active" type="checkbox" defaultChecked value="1" />
            Active
          </label>
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            placeholder="Sort"
            className="rounded-xl border border-[#A79C89]/40 px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[#3B0F14] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-1"
          >
            Add tag
          </button>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-[#A79C89]/30 text-xs uppercase tracking-wide text-[#A79C89]">
              <tr>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Slug</th>
                <th className="py-2 pr-3">Kind</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-[#A79C89]/15">
                  <td className="py-3 pr-3 text-[#3B0F14]">{tag.name}</td>
                  <td className="py-3 pr-3 text-[#1F1F1F]">{tag.slug}</td>
                  <td className="py-3 pr-3 capitalize text-[#1F1F1F]">{tag.kind}</td>
                  <td className="py-3 pr-3">{tag.is_active ? "Active" : "Inactive"}</td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          run(
                            () => setTagActiveAction(tag.id, !tag.is_active),
                            tag.is_active ? "Tag deactivated." : "Tag activated.",
                          )
                        }
                        className="text-xs font-semibold text-[#3B0F14] underline disabled:opacity-60"
                      >
                        {tag.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => run(() => deleteTagAction(tag.id), "Tag deleted.")}
                        className="text-xs font-semibold text-red-700 underline disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tags.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#A79C89]">
                    No tags yet. Run the catalog taxonomy migration to seed defaults.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

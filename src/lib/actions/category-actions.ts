"use server";

import { revalidatePath } from "next/cache";

import { logAdminAction } from "@/lib/audit/log-admin-action";
import { assertVendorOrAbove } from "@/lib/auth/admin";
import { slugify } from "@/lib/catalog/constants";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseRequired(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

export async function upsertCategoryAction(formData: FormData): Promise<ActionResult> {
  try {
    const staff = await assertVendorOrAbove();
    const admin = createAdminClient();

    const id = String(formData.get("id") ?? "").trim() || null;
    const name = parseRequired(formData, "name", "Name");
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = slugify(slugInput || name);
    const description = String(formData.get("description") ?? "").trim() || null;
    const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;
    const isActive = formData.get("is_active") === "1" || formData.get("is_active") === "on";

    if (!slug) {
      return { ok: false, error: "Slug is required." };
    }

    const payload = {
      name,
      slug,
      description,
      sort_order: sortOrder,
      is_active: isActive,
      parent_id: null,
    };

    if (id) {
      const { error } = await admin.from("categories").update(payload).eq("id", id);
      if (error) return { ok: false, error: error.message };

      await logAdminAction({
        actor: staff,
        action: "product.update",
        entityType: "category",
        entityId: id,
        summary: `Updated category ${name}`,
      });
    } else {
      const { data, error } = await admin.from("categories").insert(payload).select("id").single();
      if (error || !data) return { ok: false, error: error?.message ?? "Failed to create category." };

      await logAdminAction({
        actor: staff,
        action: "product.create",
        entityType: "category",
        entityId: data.id,
        summary: `Created category ${name}`,
      });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save category.",
    };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  try {
    const staff = await assertVendorOrAbove();
    const admin = createAdminClient();

    const { count } = await admin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);

    if ((count ?? 0) > 0) {
      return {
        ok: false,
        error: "Cannot delete a category that still has products. Move or deactivate products first.",
      };
    }

    const { error } = await admin.from("categories").delete().eq("id", categoryId);
    if (error) return { ok: false, error: error.message };

    await logAdminAction({
      actor: staff,
      action: "product.delete",
      entityType: "category",
      entityId: categoryId,
      summary: `Deleted category ${categoryId}`,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete category.",
    };
  }
}

export async function setCategoryActiveAction(
  categoryId: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const staff = await assertVendorOrAbove();
    const admin = createAdminClient();

    const { error } = await admin
      .from("categories")
      .update({ is_active: isActive })
      .eq("id", categoryId);

    if (error) return { ok: false, error: error.message };

    await logAdminAction({
      actor: staff,
      action: "product.update",
      entityType: "category",
      entityId: categoryId,
      summary: `${isActive ? "Activated" : "Deactivated"} category ${categoryId}`,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update category status.",
    };
  }
}

export async function upsertTagAction(formData: FormData): Promise<ActionResult> {
  try {
    const staff = await assertVendorOrAbove();
    const admin = createAdminClient();

    const id = String(formData.get("id") ?? "").trim() || null;
    const name = parseRequired(formData, "name", "Name");
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = slugify(slugInput || name);
    const kind = String(formData.get("kind") ?? "marketing").trim() || "marketing";
    const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;
    const isActive = formData.get("is_active") === "1" || formData.get("is_active") === "on";

    if (kind !== "marketing" && kind !== "collection") {
      return { ok: false, error: "Invalid tag kind." };
    }

    const payload = {
      name,
      slug,
      kind,
      sort_order: sortOrder,
      is_active: isActive,
    };

    if (id) {
      const { error } = await admin.from("tags").update(payload).eq("id", id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await admin.from("tags").insert(payload);
      if (error) return { ok: false, error: error.message };
    }

    await logAdminAction({
      actor: staff,
      action: id ? "product.update" : "product.create",
      entityType: "tag",
      entityId: id,
      summary: `${id ? "Updated" : "Created"} tag ${name}`,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save tag.",
    };
  }
}

export async function deleteTagAction(tagId: string): Promise<ActionResult> {
  try {
    const staff = await assertVendorOrAbove();
    const admin = createAdminClient();

    const { error } = await admin.from("tags").delete().eq("id", tagId);
    if (error) return { ok: false, error: error.message };

    await logAdminAction({
      actor: staff,
      action: "product.delete",
      entityType: "tag",
      entityId: tagId,
      summary: `Deleted tag ${tagId}`,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete tag.",
    };
  }
}

export async function setTagActiveAction(
  tagId: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const staff = await assertVendorOrAbove();
    const admin = createAdminClient();

    const { error } = await admin.from("tags").update({ is_active: isActive }).eq("id", tagId);

    if (error) return { ok: false, error: error.message };

    await logAdminAction({
      actor: staff,
      action: "product.update",
      entityType: "tag",
      entityId: tagId,
      summary: `${isActive ? "Activated" : "Deactivated"} tag ${tagId}`,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/shop");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update tag status.",
    };
  }
}

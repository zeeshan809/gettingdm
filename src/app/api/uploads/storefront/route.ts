import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentCreator } from "@/lib/auth";
import { hasStorefront } from "@/lib/plan";
import { deleteByPublicUrl, imageType, putObject, r2Configured } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";

// Storefront profile picture and cover image. The browser shrinks the image
// first; this checks it, stores it in R2, saves the URL and removes the old one.

const MAX_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB
const COLUMNS = { avatar: "avatar_url", cover: "cover_url" } as const;
type Kind = keyof typeof COLUMNS;
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

async function context(kind: string | null) {
  if (kind !== "avatar" && kind !== "cover") return { error: fail("Unknown image type.") };
  const creator = await getCurrentCreator();
  if (!hasStorefront(creator.subscription)) return { error: fail("The storefront is part of Creator Plus. Upgrade to edit it.", 403) };
  if (!r2Configured()) return { error: fail("Image uploads aren't set up yet.", 503) };
  const supabase = await createClient();
  const column = COLUMNS[kind as Kind];
  const { data } = await supabase.from("profiles").select("avatar_url, cover_url").eq("id", creator.id).single();
  return { creator, supabase, kind: kind as Kind, column, oldUrl: data?.[column] ?? null };
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const ctx = await context(form?.get("kind")?.toString() ?? null);
  if ("error" in ctx) return ctx.error;

  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose an image to upload.");
  if (file.size > MAX_BYTES) return fail("That image is too large. Please use one under 4 MB.");

  const body = await file.arrayBuffer();
  const type = imageType(new Uint8Array(body, 0, Math.min(12, body.byteLength)));
  if (!type) return fail("Please upload a JPG, PNG or WebP image.");

  const key = `storefront/${ctx.creator.id}/${ctx.kind}-${randomBytes(6).toString("hex")}.${EXT[type]}`;
  let url: string;
  try {
    url = await putObject(key, body, type);
  } catch (e) {
    console.error(e);
    return fail("Upload failed. Please try again.", 502);
  }

  const { error } = await ctx.supabase.from("profiles").update(ctx.kind === "avatar" ? { avatar_url: url } : { cover_url: url }).eq("id", ctx.creator.id);
  if (error) {
    console.error("save image url failed", error);
    await deleteByPublicUrl(url);
    return fail("Couldn't save the image. Please try again.", 500);
  }
  await deleteByPublicUrl(ctx.oldUrl);
  revalidatePath("/", "layout");
  return NextResponse.json({ url });
}

export async function DELETE(request: NextRequest) {
  const ctx = await context(request.nextUrl.searchParams.get("kind"));
  if ("error" in ctx) return ctx.error;
  const { error } = await ctx.supabase.from("profiles").update(ctx.kind === "avatar" ? { avatar_url: null } : { cover_url: null }).eq("id", ctx.creator.id);
  if (error) return fail("Couldn't remove the image. Please try again.", 500);
  await deleteByPublicUrl(ctx.oldUrl);
  revalidatePath("/", "layout");
  return NextResponse.json({ url: null });
}

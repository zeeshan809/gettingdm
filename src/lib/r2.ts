import "server-only";
import { AwsClient } from "aws4fetch";

// Cloudflare R2 (S3-compatible) image storage. aws4fetch signs plain fetch()
// requests, so this runs the same on Vercel and Cloudflare.

const env = () => ({
  account: process.env.R2_ACCOUNT_ID,
  bucket: process.env.R2_BUCKET,
  key: process.env.R2_ACCESS_KEY_ID,
  secret: process.env.R2_SECRET_ACCESS_KEY,
  publicUrl: process.env.R2_PUBLIC_URL?.replace(/\/+$/, ""),
});

export const r2Configured = () => Object.values(env()).every(Boolean);

function client() {
  const e = env();
  if (!e.account || !e.bucket || !e.key || !e.secret || !e.publicUrl) throw new Error("R2 is not configured");
  return {
    aws: new AwsClient({ accessKeyId: e.key, secretAccessKey: e.secret, service: "s3", region: "auto" }),
    objectUrl: (key: string) => `https://${e.account}.r2.cloudflarestorage.com/${e.bucket}/${key}`,
    publicUrl: e.publicUrl,
  };
}

// Uploads and returns the public URL.
export async function putObject(key: string, body: ArrayBuffer, contentType: string) {
  const c = client();
  const bytes = new Uint8Array(body);
  // Sign, then send the raw bytes ourselves. Sending aws4fetch's signed Request
  // streams the body without a size on Vercel, and R2 rejects that (411).
  const signed = await c.aws.sign(c.objectUrl(key), {
    method: "PUT",
    body: bytes,
    headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
  });
  const headers = new Headers(signed.headers);
  headers.set("Content-Length", String(bytes.byteLength));
  const res = await fetch(signed.url, { method: "PUT", headers, body: bytes });
  if (!res.ok) throw new Error(`R2 upload failed (${res.status})`);
  return `${c.publicUrl}/${key}`;
}

// Deletes an object we stored, given its public URL. Other URLs are ignored.
export async function deleteByPublicUrl(url: string | null | undefined) {
  if (!url || !r2Configured()) return;
  const c = client();
  if (!url.startsWith(`${c.publicUrl}/`)) return;
  const res = await c.aws.fetch(c.objectUrl(url.slice(c.publicUrl.length + 1)), { method: "DELETE" });
  if (!res.ok && res.status !== 404) console.error("R2 delete failed", res.status);
}

// JPEG, PNG or WebP, judged by the file's first bytes rather than its name.
export function imageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

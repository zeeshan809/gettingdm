import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-violet-700">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-zinc-500">This storefront or page doesn&apos;t exist.</p>
      <LinkButton href="/" className="mt-6">Go home</LinkButton>
    </div>
  );
}

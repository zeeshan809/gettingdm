import Link from "next/link";
import { Logo } from "@/components/logo";
import { APP_NAME } from "@/lib/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" aria-label={APP_NAME} className="mb-8 inline-flex items-center">
        <Logo className="h-9 w-auto" />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
    </div>
  );
}

import Link from "next/link";
import { Zap } from "lucide-react";
import { APP_NAME } from "@/lib/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-white">
          <Zap className="h-4 w-4" />
        </span>
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
    </div>
  );
}

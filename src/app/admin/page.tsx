import type { Metadata } from "next";
import { adminConfigured, isAuthed } from "@/lib/admin-auth";
import AdminApp from "@/components/admin/AdminApp";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <div className="container-wide max-w-xl py-24">
        <h1 className="display text-4xl">Admin belum aktif</h1>
        <p className="mt-6 leading-relaxed text-muted">
          Tambahkan dua variabel lingkungan di server (Vercel → Settings → Environment Variables), lalu redeploy:
        </p>
        <ul className="mt-4 space-y-2 font-mono text-sm">
          <li><b>ADMIN_PASSWORD</b>: password pilihan Anda</li>
          <li><b>GITHUB_TOKEN</b>: token GitHub dengan izin Contents (Read and write)</li>
        </ul>
        <p className="mt-6 text-sm text-muted">Langkah lengkap ada di README.md.</p>
      </div>
    );
  }
  return (await isAuthed()) ? <AdminApp /> : <LoginForm />;
}

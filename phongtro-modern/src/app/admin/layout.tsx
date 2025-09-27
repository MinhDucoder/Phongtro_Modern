'use client';

import { Toaster } from "react-hot-toast";
import AdminGuard from "@/components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  );
}



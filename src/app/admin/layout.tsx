
import AdminSidebar from '@/components/layout/AdminSidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Tempus Concierge',
  description: 'Gestione Tempus Concierge.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex flex-col flex-1 p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

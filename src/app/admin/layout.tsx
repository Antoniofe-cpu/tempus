
import AdminSidebar from '@/components/layout/AdminSidebar';
import type { Metadata } from 'next';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

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
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <SidebarInset className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

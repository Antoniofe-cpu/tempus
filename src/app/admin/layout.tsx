
'use client'; // Layout Admin deve essere un Client Component per gestire l'auth

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

// export const metadata: Metadata = { // metadata non può essere usato in Client Component, spostato o rimosso
//   title: 'Admin Dashboard - Tempus Concierge',
//   description: 'Gestione Tempus Concierge.',
// };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login?redirect=/admin'); // Reindirizza se non loggato
      }
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Gestisce il titolo della pagina dinamicamente se necessario
    if (typeof window !== "undefined") {
        document.title = 'Admin Dashboard - Tempus Concierge';
    }
  }, []);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 text-accent animate-spin" />
        <p className="ml-3 text-muted-foreground">Verifica autenticazione...</p>
      </div>
    );
  }

  if (!user) {
    // Potrebbe mostrare un messaggio o null mentre il redirect ha effetto
    // Ma il redirect nell'useEffect dovrebbe gestire questo.
    // Per sicurezza, si può mostrare un caricamento anche qui.
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 text-accent animate-spin" />
        <p className="ml-3 text-muted-foreground">Reindirizzamento al login...</p>
      </div>
    );
  }

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

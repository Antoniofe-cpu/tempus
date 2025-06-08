
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
  const [isAuthorized, setIsAuthorized] = useState(false); // Aggiunto per futura logica di autorizzazione

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login?redirect=/admin'); // Reindirizza se non loggato
        setUser(null);
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      
      setUser(currentUser);
      
      // --- INIZIO SEZIONE PER FUTURA AUTORIZZAZIONE ADMIN ---
      // Qui andrebbe verificato se l'utente ha i custom claims di admin.
      // Esempio (richiede configurazione dei custom claims su Firebase):
      // const idTokenResult = await currentUser.getIdTokenResult();
      // if (idTokenResult.claims.admin) {
      //   setIsAuthorized(true);
      // } else {
      //   setIsAuthorized(false);
      //   // Opzionale: reindirizzare a una pagina "Accesso Negato" o alla homepage
      //   // router.push('/accesso-negato'); 
      //   // Per ora, se non admin, semplicemente non mostra il contenuto admin ma non reindirizza.
      //   // Questo comportamento andrà affinato.
      //   console.warn("Utente autenticato ma non autorizzato come admin.");
      // }
      // --- FINE SEZIONE PER FUTURA AUTORIZZAZIONE ADMIN ---
      
      // Per ora, consideriamo autorizzato chiunque sia loggato,
      // il link "Admin" è nascosto agli utenti normali.
      setIsAuthorized(true); 
      
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
        document.title = 'Admin Dashboard - Tempus Concierge';
    }
  }, []);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 text-accent animate-spin" />
        <p className="ml-3 text-muted-foreground">Verifica autenticazione e autorizzazione...</p>
      </div>
    );
  }

  if (!user) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 text-accent animate-spin" />
        <p className="ml-3 text-muted-foreground">Reindirizzamento al login...</p>
      </div>
    );
  }

  // Se si implementa il controllo dei claims e l'utente non è autorizzato:
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
        <h1 className="text-2xl font-bold text-destructive mb-4">Accesso Negato</h1>
        <p className="text-muted-foreground mb-6">Non disponi delle autorizzazioni necessarie per visualizzare questa pagina.</p>
        <Button onClick={() => router.push('/')}>Torna alla Homepage</Button>
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

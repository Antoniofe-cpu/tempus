
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserCircle } from 'lucide-react'; // Rimosso UserPlus, LayoutDashboard
import { useToast } from '@/hooks/use-toast';

interface AuthNavLinksProps {
  isMobile?: boolean;
}

export default function AuthNavLinks({ isMobile }: AuthNavLinksProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logout Effettuato', description: 'A presto!' });
      router.push('/');
    } catch (error) {
      console.error('Errore durante il logout:', error);
      toast({ title: 'Errore Logout', description: 'Non è stato possibile effettuare il logout.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return isMobile ? (
      <div className="flex items-center space-x-3 rounded-md p-2 animate-pulse bg-muted/50 h-10 w-full"></div>
    ) : (
      <div className="animate-pulse bg-muted/50 h-6 w-16 rounded-md"></div>
    );
  }

  if (user) {
    // Utente Loggato
    const profileLink = { href: '/profilo', label: 'Il Mio Profilo', icon: <UserCircle className={`h-5 w-5 ${isMobile ? 'text-accent' : ''}`} /> };
    // Il link Admin è stato rimosso dalla visualizzazione standard per gli utenti loggati.
    // L'accesso a /admin rimane protetto da login, ma una vera autorizzazione admin
    // richiederebbe la verifica di custom claims.

    if (isMobile) {
      return (
        <>
          <Link href={profileLink.href} className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-accent/10 hover:text-accent">
            {profileLink.icon}
            <span>{profileLink.label}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-destructive/10 hover:text-destructive w-full text-left"
          >
            <LogOut className={`h-5 w-5 ${isMobile ? 'text-destructive' : 'text-destructive'}`} />
            <span>Logout</span>
          </button>
        </>
      );
    }
    return (
      <>
        <Link href={profileLink.href} className="transition-colors hover:text-accent">
          {profileLink.label}
        </Link>
        <Button variant="ghost" onClick={handleLogout} className="hover:text-destructive hover:bg-destructive/10 px-3 py-2 h-auto">
          <LogOut className="h-5 w-5 mr-1 md:mr-0 lg:mr-1" /> <span className="hidden md:inline lg:hidden xl:inline">Logout</span>
        </Button>
      </>
    );
  }

  // Utente non loggato
  const loginLink = { href: '/login', label: 'Login', icon: <LogIn className={`h-5 w-5 ${isMobile ? 'text-accent' : ''}`} /> };
  // Il link Registrati è stato rimosso dalla navbar principale, è accessibile dalla pagina di Login.

  if (isMobile) {
    return (
      <>
        <Link href={loginLink.href} className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-accent/10 hover:text-accent">
          {loginLink.icon}
          <span>{loginLink.label}</span>
        </Link>
      </>
    );
  }
  return (
    <>
      <Link href={loginLink.href} className="transition-colors hover:text-accent">
        {loginLink.label}
      </Link>
    </>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, LogOut, UserCircle, LayoutDashboard } from 'lucide-react'; // Added UserCircle & LayoutDashboard
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
    // Potresti mostrare uno skeleton o null durante il caricamento
    return isMobile ? (
      <>
        <div className="flex items-center space-x-3 rounded-md p-2 animate-pulse bg-muted/50 h-10 w-full"></div>
        <div className="flex items-center space-x-3 rounded-md p-2 animate-pulse bg-muted/50 h-10 w-full"></div>
      </>
    ) : (
      <>
        <div className="animate-pulse bg-muted/50 h-6 w-16 rounded-md"></div>
        <div className="animate-pulse bg-muted/50 h-6 w-16 rounded-md"></div>
      </>
    );
  }

  if (user) {
    // Utente Loggato
    const profileLink = { href: '/profilo', label: 'Il Mio Profilo', icon: <UserCircle className={`h-5 w-5 ${isMobile ? 'text-accent' : ''}`} /> };
    const adminLink = { href: '/admin', label: 'Admin', icon: <LayoutDashboard className={`h-5 w-5 ${isMobile ? 'text-accent' : ''}`} /> };
    // Per ora, assumiamo che tutti gli utenti loggati possano vedere il link Admin. 
    // In futuro, potresti volerlo basare su ruoli specifici.

    if (isMobile) {
      return (
        <>
          <Link href={profileLink.href} className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-accent/10 hover:text-accent">
            {profileLink.icon}
            <span>{profileLink.label}</span>
          </Link>
          <Link href={adminLink.href} className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-accent/10 hover:text-accent">
            {adminLink.icon}
            <span>{adminLink.label}</span>
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
        <Link href={adminLink.href} className="transition-colors hover:text-accent">
          {adminLink.label}
        </Link>
        <Button variant="ghost" onClick={handleLogout} className="hover:text-destructive hover:bg-destructive/10 px-3 py-2 h-auto">
          <LogOut className="h-5 w-5 mr-1 md:mr-0 lg:mr-1" /> <span className="hidden md:inline lg:hidden xl:inline">Logout</span>
        </Button>
      </>
    );
  }

  // Utente non loggato
  const loginLink = { href: '/login', label: 'Login', icon: <LogIn className={`h-5 w-5 ${isMobile ? 'text-accent' : ''}`} /> };
  const registerLink = { href: '/registrazione', label: 'Registrati', icon: <UserPlus className={`h-5 w-5 ${isMobile ? 'text-accent' : ''}`} /> };

  if (isMobile) {
    return (
      <>
        <Link href={loginLink.href} className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-accent/10 hover:text-accent">
          {loginLink.icon}
          <span>{loginLink.label}</span>
        </Link>
        <Link href={registerLink.href} className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-accent/10 hover:text-accent">
          {registerLink.icon}
          <span>{registerLink.label}</span>
        </Link>
      </>
    );
  }
  return (
    <>
      <Link href={loginLink.href} className="transition-colors hover:text-accent">
        {loginLink.label}
      </Link>
      <Link href={registerLink.href} className="transition-colors hover:text-accent">
        {registerLink.label}
      </Link>
    </>
  );
}

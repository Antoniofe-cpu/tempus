
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, WatchIcon, Search, Briefcase } from 'lucide-react'; 
import React, { Suspense } from 'react'; // Import Suspense
import AuthNavLinks from './AuthNavLinks'; 

const mainNavItems = [
  { href: '/', label: 'Home', icon: <WatchIcon className="h-5 w-5 text-accent" /> },
  { href: '/shop', label: 'Shop', icon: <Search className="h-5 w-5 text-accent" /> },
  { href: '/richiesta-personalizzata', label: 'Richiesta', icon: <Briefcase className="h-5 w-5 text-accent" /> },
];

// Fallback component for AuthNavLinks during suspense
function AuthNavLinksDesktopFallback() {
  return (
    <>
      <div className="animate-pulse bg-muted/50 h-6 w-16 rounded-md"></div>
      <div className="animate-pulse bg-muted/50 h-8 w-20 rounded-md ml-2"></div>
    </>
  );
}

function AuthNavLinksMobileFallback() {
  return (
    <>
      <div className="animate-pulse bg-muted/50 h-10 w-full rounded-md"></div>
      <div className="animate-pulse bg-muted/50 h-10 w-full rounded-md mt-4"></div>
    </>
  );
}


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <WatchIcon className="h-8 w-8 text-accent" />
          <span className="font-headline text-2xl font-bold text-accent">Tempus Concierge</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {mainNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
          <Suspense fallback={<AuthNavLinksDesktopFallback />}>
            <AuthNavLinks /> {/* Link di autenticazione per desktop */}
          </Suspense>
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Apri menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background">
              <div className="p-6">
                <Link href="/" className="mb-8 flex items-center space-x-2">
                   <WatchIcon className="h-7 w-7 text-accent" />
                   <span className="font-headline text-xl font-bold text-accent">Tempus Concierge</span>
                </Link>
                <nav className="flex flex-col space-y-4">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-accent/10 hover:text-accent"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <Suspense fallback={<AuthNavLinksMobileFallback />}>
                    <AuthNavLinks isMobile={true} /> {/* Link di autenticazione per mobile */}
                  </Suspense>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}


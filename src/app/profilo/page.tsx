
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, type User, updateProfile, deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserCircle, Mail, Edit3, ListChecks, AlertTriangleIcon, Trash2, Save, X } from 'lucide-react';
import type { PersonalizedRequest, RequestStatus } from '@/lib/types';
import { getRequestsByEmail } from '@/services/requestService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getStatusBadgeStyle = (status?: RequestStatus): string => {
  switch (status) {
    case 'Nuova': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-600';
    case 'In Valutazione': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-700/30 dark:text-purple-300 dark:border-purple-600';
    case 'In Lavorazione': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-600';
    case 'In Attesa Risposta Cliente': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-700/30 dark:text-orange-300 dark:border-orange-600';
    case 'In Attesa di Pagamento': return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-700/30 dark:text-teal-300 dark:border-teal-600';
    case 'Completata': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600';
    case 'Cancellata': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-700/30 dark:text-red-300 dark:border-red-600';
    case 'Archiviata': return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600';
    default: return 'bg-gray-200 text-gray-700 border-gray-400 dark:bg-gray-600/30 dark:text-gray-400 dark:border-gray-500';
  }
};

export default function ProfiloPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRequests, setUserRequests] = useState<PersonalizedRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login?redirect=/profilo');
      } else {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        if (currentUser.email) {
          fetchUserRequests(currentUser.email);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchUserRequests = async (email: string) => {
    setIsLoadingRequests(true);
    setRequestsError(null);
    try {
      const requests = await getRequestsByEmail(email);
      setUserRequests(requests);
    } catch (error) {
      console.error("Errore nel caricamento delle richieste utente:", error);
      const errorMessage = (error as Error).message || "Impossibile caricare le tue richieste al momento.";
      setRequestsError(errorMessage);
      toast({
        title: "Errore Richieste",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleUpdateName = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim()) {
      toast({ title: "Errore", description: "Il nome non può essere vuoto.", variant: "destructive" });
      return;
    }
    if (displayName.trim() === user.displayName) {
      setIsEditingName(false);
      return;
    }

    setIsUpdatingName(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      // Aggiorna lo stato locale dell'utente per riflettere il cambiamento
      setUser(auth.currentUser); 
      toast({ title: "Successo", description: "Nome aggiornato con successo." });
      setIsEditingName(false);
    } catch (error) {
      console.error("Errore durante l'aggiornamento del nome:", error);
      toast({ title: "Errore", description: "Impossibile aggiornare il nome.", variant: "destructive" });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      await deleteUser(user);
      toast({ title: "Account Eliminato", description: "Il tuo account è stato eliminato con successo." });
      router.push('/'); // onAuthStateChanged dovrebbe comunque gestire il redirect se l'utente diventa null
    } catch (error: any) {
      console.error("Errore durante l'eliminazione dell'account:", error);
      if (error.code === 'auth/requires-recent-login') {
        toast({
          title: "Azione Richiede Login Recente",
          description: "Per eliminare il tuo account, per favore effettua nuovamente il login e riprova.",
          variant: "destructive",
          duration: 7000,
        });
      } else {
        toast({
          title: "Errore Eliminazione Account",
          description: error.message || "Impossibile eliminare l'account.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 md:py-16 flex items-center justify-center">
          <Loader2 className="h-16 w-16 text-accent animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 md:py-16 flex items-center justify-center">
          <p className="text-muted-foreground">Per favore, effettua il login per vedere il tuo profilo.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="space-y-10">
          <Card className="w-full max-w-2xl mx-auto shadow-xl bg-card border-border/60">
            <CardHeader className="text-center">
              <UserCircle className="mx-auto h-20 w-20 text-accent mb-4" />
              <CardTitle className="font-headline text-3xl text-primary">Il Mio Profilo</CardTitle>
              <CardDescription className="text-muted-foreground">
                Visualizza e gestisci le informazioni del tuo account e le tue richieste.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-foreground/90">Informazioni Personali</h3>
                <div className="p-4 border rounded-md bg-muted/30 space-y-3">
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                     {isEditingName ? (
                        <form onSubmit={handleUpdateName} className="flex items-center gap-2 w-full">
                          <Label htmlFor="displayName" className="sr-only">Nome Visualizzato</Label>
                          <Input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="h-9 flex-grow bg-input"
                            disabled={isUpdatingName}
                          />
                          <Button type="submit" size="icon" variant="ghost" className="text-green-500 hover:text-green-600" disabled={isUpdatingName}>
                            {isUpdatingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span className="sr-only">Salva Nome</span>
                          </Button>
                          <Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive/80" onClick={() => {setIsEditingName(false); setDisplayName(user.displayName || '');}} disabled={isUpdatingName}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Annulla</span>
                          </Button>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                           <p><span className="font-medium text-foreground/80">Nome:</span> {user.displayName || 'Non specificato'}</p>
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-accent" onClick={() => setIsEditingName(true)}>
                             <Edit3 className="h-4 w-4" />
                             <span className="sr-only">Modifica Nome</span>
                           </Button>
                        </div>
                      )}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                    <p><span className="font-medium text-foreground/80">Email:</span> {user.email}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">La modifica della password non è ancora implementata qui. Puoi usare il flusso "Password Dimenticata" dalla pagina di login.</p>
              </div>
              
              <div className="pt-6 border-t border-border/40">
                <h3 className="font-semibold text-lg text-foreground/90 mb-2">Impostazioni Account</h3>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto" disabled={isDeletingAccount}>
                      {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      {isDeletingAccount ? "Eliminazione..." : "Elimina Account"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border/60">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-primary">Sei assolutamente sicuro?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Questa azione non può essere annullata. Il tuo account e tutti i dati associati verranno eliminati permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        disabled={isDeletingAccount}
                      >
                        Sì, Elimina Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                 <p className="text-xs text-muted-foreground mt-2">Se riscontri problemi durante l'eliminazione, prova a fare logout e login di nuovo.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl mx-auto shadow-xl bg-card border-border/60">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary flex items-center">
                <ListChecks className="h-7 w-7 mr-3 text-accent" />
                Le Mie Richieste Personalizzate
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Visualizza lo storico e lo stato delle tue richieste di orologi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRequests ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-12 w-12 text-accent animate-spin" />
                  <p className="ml-3 text-muted-foreground">Caricamento richieste...</p>
                </div>
              ) : requestsError ? (
                <div className="flex flex-col items-center justify-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
                  <AlertTriangleIcon className="h-10 w-10 mb-3" />
                  <p className="font-semibold">Errore nel Caricamento</p>
                  <p className="text-sm">{requestsError}</p>
                </div>
              ) : userRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">ID Richiesta</TableHead>
                        <TableHead>Tipo Orologio</TableHead>
                        <TableHead>Marca/Modello Desiderati</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Data Invio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-mono text-xs truncate max-w-[100px]">{request.id}</TableCell>
                          <TableCell>{request.watchType}</TableCell>
                          <TableCell>
                            {request.desiredBrand || request.desiredModel ? 
                              `${request.desiredBrand || ''} ${request.desiredModel || ''}`.trim() : 
                              <span className="text-muted-foreground/70">N/D</span>}
                          </TableCell>
                          <TableCell>
                            {request.budgetMin !== undefined || request.budgetMax !== undefined ?
                             `€${(request.budgetMin ?? 0).toLocaleString('it-IT')} - €${(request.budgetMax ?? 0).toLocaleString('it-IT')}` :
                             <span className="text-muted-foreground/70">N/D</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("font-normal text-xs whitespace-nowrap", getStatusBadgeStyle(request.status))}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(request.createdAt), 'dd MMM yyyy', { locale: it })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <ListChecks className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="mb-2">Non hai ancora effettuato richieste personalizzate.</p>
                  <Button asChild variant="link" className="text-accent">
                    <Link href="/richiesta-personalizzata">Invia la tua prima richiesta</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
    


'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2, Loader2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogDesc,
  DialogFooter,
  DialogHeader,
  DialogTitle as DialogT,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PersonalizedRequest, RequestStatus, WatchType as WatchTypeEnum } from '@/lib/types';
import { AllRequestStatuses } from '@/lib/types';
import { getRequests, addRequestService, updateRequestService, deleteRequestService } from '@/services/requestService';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils'; // Import mancante aggiunto qui

const watchTypesArray: WatchTypeEnum[] = ['Dress', 'Sportivo', 'Cronografo', 'Subacqueo', 'Vintage', 'Altro'];

const RequestFormSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  watchType: z.string().min(1, { message: "Seleziona un tipo di orologio." }),
  desiredBrand: z.string().optional(),
  desiredModel: z.string().optional(),
  budgetMin: z.coerce.number().min(0).optional().nullable(),
  budgetMax: z.coerce.number().min(0).optional().nullable(),
  aiCriteria: z.string().max(500).optional(),
  additionalNotes: z.string().max(1000).optional(),
  status: z.enum(AllRequestStatuses),
}).refine(data => !data.budgetMin || !data.budgetMax || data.budgetMax >= data.budgetMin, {
  message: "Il budget massimo deve essere maggiore o uguale al budget minimo.",
  path: ["budgetMax"],
});

type RequestFormData = z.infer<typeof RequestFormSchema>;

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

export default function AdminRichiestePage() {
  const [requestsList, setRequestsList] = useState<PersonalizedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PersonalizedRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestToDelete, setRequestToDelete] = useState<PersonalizedRequest | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(RequestFormSchema),
  });

  const fetchAdminRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const requests = await getRequests();
      setRequestsList(requests);
    } catch (error) {
      console.error("Errore nel caricamento delle richieste:", error);
      toast({ title: "Errore", description: `Impossibile caricare le richieste: ${(error as Error).message}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdminRequests();
  }, [fetchAdminRequests]);
  
  useEffect(() => {
    if (isDialogOpen) {
      if (editingRequest) {
        reset({
          ...editingRequest,
          budgetMin: editingRequest.budgetMin ?? null,
          budgetMax: editingRequest.budgetMax ?? null,
        });
      } else {
        reset({
          name: '',
          email: '',
          watchType: '',
          desiredBrand: '',
          desiredModel: '',
          budgetMin: null,
          budgetMax: null,
          aiCriteria: '',
          additionalNotes: '',
          status: 'Nuova',
        });
      }
    }
  }, [isDialogOpen, editingRequest, reset]);

  const onSubmit = async (data: RequestFormData) => {
    try {
      const requestPayload = {
        ...data,
        budgetMin: data.budgetMin ?? undefined,
        budgetMax: data.budgetMax ?? undefined,
      };

      if (editingRequest) {
        await updateRequestService(editingRequest.id, requestPayload);
        toast({ title: "Successo", description: "Richiesta modificata con successo." });
      } else {
        // Per addRequestService, createdAt è gestito dal servizio
        const { status, ...rest } = requestPayload; // status is required
        await addRequestService({ ...rest, status: status || 'Nuova'});
        toast({ title: "Successo", description: "Richiesta aggiunta con successo." });
      }
      await fetchAdminRequests();
      resetFormStates();
    } catch (error: any) {
      console.error("Errore nel salvataggio della richiesta:", error);
      toast({ title: "Errore", description: error.message || "Impossibile salvare la richiesta.", variant: "destructive" });
    }
  };

  const resetFormStates = () => {
    reset();
    setEditingRequest(null);
    setIsDialogOpen(false);
  };

  const handleAddNewClick = () => {
    setEditingRequest(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (request: PersonalizedRequest) => {
    setEditingRequest(request);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirmation = (request: PersonalizedRequest) => {
    setRequestToDelete(request);
  };

  const executeDelete = async () => {
    if (requestToDelete) {
      try {
        await deleteRequestService(requestToDelete.id);
        toast({ title: "Successo", description: `Richiesta "${requestToDelete.id}" eliminata.` });
        await fetchAdminRequests();
        setRequestToDelete(null);
      } catch (error: any) {
        console.error("Errore nell'eliminazione della richiesta:", error);
        toast({ title: "Errore", description: error.message || "Impossibile eliminare la richiesta.", variant: "destructive" });
      }
    }
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredRequests = requestsList.filter(request =>
    request.id.toLowerCase().includes(searchTerm) ||
    request.name.toLowerCase().includes(searchTerm) ||
    request.email.toLowerCase().includes(searchTerm) ||
    request.watchType.toLowerCase().includes(searchTerm) ||
    request.status.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gestione Richieste Clienti</h1>
          <p className="text-muted-foreground mt-1">Visualizza, aggiungi e gestisci tutte le richieste personalizzate.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetFormStates();
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNewClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-5 w-5" />
              Aggiungi Richiesta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl bg-card border-border/60 shadow-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogT className="font-headline text-2xl text-primary text-left">{editingRequest ? "Modifica Richiesta" : "Aggiungi Nuova Richiesta"}</DialogT>
              <DialogDesc className="text-muted-foreground text-left">
                {editingRequest ? "Modifica i dettagli della richiesta esistente." : "Inserisci i dettagli della nuova richiesta."}
              </DialogDesc>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-foreground/80">Nome Cliente</Label>
                  <Input id="name" {...register("name")} className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground/80">Email Cliente</Label>
                  <Input id="email" type="email" {...register("email")} className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="status" className="text-foreground/80">Stato Richiesta</Label>
                <Controller
                  name="status"
                  control={control}
                  defaultValue="Nuova"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="status" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent">
                        <SelectValue placeholder="Seleziona uno stato" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {AllRequestStatuses.map(statusVal => (
                          <SelectItem key={statusVal} value={statusVal} className="hover:bg-accent/20 focus:bg-accent/20">{statusVal}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
              </div>

              <div>
                <Label htmlFor="watchType" className="text-foreground/80">Tipo Orologio</Label>
                 <Controller
                  name="watchType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""} >
                      <SelectTrigger id="watchType" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent">
                        <SelectValue placeholder="Seleziona un tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {watchTypesArray.map(type => (
                          <SelectItem key={type} value={type} className="hover:bg-accent/20 focus:bg-accent/20">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.watchType && <p className="text-sm text-destructive mt-1">{errors.watchType.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="desiredBrand" className="text-foreground/80">Marca Desiderata</Label>
                  <Input id="desiredBrand" {...register("desiredBrand")} className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
                </div>
                <div>
                  <Label htmlFor="desiredModel" className="text-foreground/80">Modello Desiderato</Label>
                  <Input id="desiredModel" {...register("desiredModel")} className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetMin" className="text-foreground/80">Budget Min (€)</Label>
                  <Input id="budgetMin" type="number" step="0.01" {...register("budgetMin")} className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
                  {errors.budgetMin && <p className="text-sm text-destructive mt-1">{errors.budgetMin.message}</p>}
                </div>
                <div>
                  <Label htmlFor="budgetMax" className="text-foreground/80">Budget Max (€)</Label>
                  <Input id="budgetMax" type="number" step="0.01" {...register("budgetMax")} className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
                  {errors.budgetMax && <p className="text-sm text-destructive mt-1">{errors.budgetMax.message}</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="aiCriteria" className="text-foreground/80">Criteri per AI</Label>
                <Textarea id="aiCriteria" {...register("aiCriteria")} className="mt-1 min-h-[80px] bg-input border-border focus:border-accent focus:ring-accent" />
                {errors.aiCriteria && <p className="text-sm text-destructive mt-1">{errors.aiCriteria.message}</p>}
              </div>
              <div>
                <Label htmlFor="additionalNotes" className="text-foreground/80">Note Aggiuntive</Label>
                <Textarea id="additionalNotes" {...register("additionalNotes")} className="mt-1 min-h-[100px] bg-input border-border focus:border-accent focus:ring-accent" />
                {errors.additionalNotes && <p className="text-sm text-destructive mt-1">{errors.additionalNotes.message}</p>}
              </div>
              
              {editingRequest && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>ID Richiesta: {editingRequest.id}</p>
                  <p>Creata il: {format(new Date(editingRequest.createdAt), 'dd/MM/yyyy HH:mm', { locale: it })}</p>
                  {editingRequest.updatedAt && <p>Ultima modifica: {format(new Date(editingRequest.updatedAt), 'dd/MM/yyyy HH:mm', { locale: it })}</p>}
                </div>
              )}

              <DialogFooter className="mt-2 pt-4 border-t border-border/40">
                <DialogClose asChild>
                   <Button type="button" variant="outline" onClick={resetFormStates}>Annulla</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingRequest ? "Salva Modifiche" : "Crea Richiesta"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card shadow-lg">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline text-xl text-primary">Elenco Richieste (Firestore)</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cerca per ID, cliente, email, tipo, stato..." 
                className="pl-9 w-full sm:w-[300px] bg-input" 
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 text-accent animate-spin" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">ID Richiesta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo Orologio</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data Creazione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-xs">{request.id}</TableCell>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.watchType}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-normal", getStatusBadgeStyle(request.status))}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(request.createdAt), 'dd MMM yyyy', { locale: it })}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80" onClick={() => handleEditClick(request)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Modifica</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteConfirmation(request)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Elimina</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border/60">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-primary">Sei sicuro?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Questa azione non può essere annullata. La richiesta da parte di "{requestToDelete?.name}" (ID: {requestToDelete?.id}) verrà eliminata permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setRequestToDelete(null)} className="hover:bg-muted/50">Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Elimina</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchTerm ? `Nessuna richiesta trovata per "${searchTerm}".` : "Nessuna richiesta presente."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


    
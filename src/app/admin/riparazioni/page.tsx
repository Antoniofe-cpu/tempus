
// src/app/admin/riparazioni/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2, Loader2, Wrench } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { RepairRequest, RepairRequestStatus } from '@/lib/types';
import { AllRepairRequestStatuses } from '@/lib/types';
import { getRepairRequests, updateRepairRequestService, deleteRepairRequestService, addRepairRequestService } from '@/services/repairRequestService';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const RepairRequestFormSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  phone: z.string().optional(),
  watchBrand: z.string().min(1, { message: "Marca obbligatoria."}),
  watchModel: z.string().min(1, { message: "Modello obbligatorio."}),
  watchSerialNumber: z.string().optional(),
  problemDescription: z.string().min(5, { message: "Descrizione problema obbligatoria (min 5 caratteri)."}),
  status: z.enum(AllRepairRequestStatuses),
  adminNotes: z.string().optional(),
  quoteAmount: z.coerce.number().min(0).optional().nullable(),
  quoteDetails: z.string().optional(),
  // estimatedCompletionDate: z.date().optional().nullable(), // Per ora stringa, poi si può usare Calendar
  // actualCompletionDate: z.date().optional().nullable(), // Per ora stringa
});

type RepairRequestFormData = z.infer<typeof RepairRequestFormSchema>;

const getStatusBadgeStyle = (status?: RepairRequestStatus): string => { // Adattare gli stili se necessario
  // Stessi stili di PersonalizedRequest per coerenza, possono essere personalizzati
  switch (status) {
    case 'Nuova': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-600';
    case 'In Valutazione': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-700/30 dark:text-purple-300 dark:border-purple-600';
    case 'Preventivo Inviato': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-600';
    case 'Approvata dal Cliente': return 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-700/30 dark:text-cyan-300 dark:border-cyan-600';
    case 'Rifiutata dal Cliente': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-700/30 dark:text-orange-300 dark:border-orange-600';
    case 'In Riparazione': return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-700/30 dark:text-indigo-300 dark:border-indigo-600';
    case 'Riparazione Completata': return 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-700/30 dark:text-lime-300 dark:border-lime-600';
    case 'In Attesa di Pagamento': return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-700/30 dark:text-teal-300 dark:border-teal-600';
    case 'Pagamento Ricevuto': return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-700/30 dark:text-emerald-300 dark:border-emerald-600';
    case 'Pronta per Ritiro/Spedizione': return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-700/30 dark:text-sky-300 dark:border-sky-600';
    case 'Conclusa': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600';
    case 'Non Riparabile': return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-700/30 dark:text-rose-300 dark:border-rose-600';
    case 'Cancellata': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-700/30 dark:text-red-300 dark:border-red-600';
    default: return 'bg-gray-200 text-gray-700 border-gray-400 dark:bg-gray-600/30 dark:text-gray-400 dark:border-gray-500';
  }
};


export default function AdminRiparazioniPage() {
  const [repairRequestsList, setRepairRequestsList] = useState<RepairRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RepairRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestToDelete, setRequestToDelete] = useState<RepairRequest | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, control, formState: { errors }, setValue } = useForm<RepairRequestFormData>({
    resolver: zodResolver(RepairRequestFormSchema),
    defaultValues: { status: 'Nuova' }
  });

  const fetchAdminRepairRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const requests = await getRepairRequests();
      setRepairRequestsList(requests);
    } catch (error) {
      console.error("Errore nel caricamento delle richieste di riparazione:", error);
      toast({ title: "Errore", description: `Impossibile caricare le richieste: ${(error as Error).message}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdminRepairRequests();
  }, [fetchAdminRepairRequests]);
  
  useEffect(() => {
    if (isDialogOpen) {
      if (editingRequest) {
        reset({
          ...editingRequest,
          quoteAmount: editingRequest.quoteAmount ?? null,
        });
      } else {
        reset({
          name: '', email: '', phone: '', watchBrand: '', watchModel: '', watchSerialNumber: '',
          problemDescription: '', status: 'Nuova', adminNotes: '', quoteAmount: null, quoteDetails: ''
        });
      }
    }
  }, [isDialogOpen, editingRequest, reset]);

  const onSubmit = async (data: RepairRequestFormData) => {
    try {
      const requestPayload = {
        ...data,
        quoteAmount: data.quoteAmount ?? undefined,
        // estimatedCompletionDate: data.estimatedCompletionDate ? new Date(data.estimatedCompletionDate) : undefined,
        // actualCompletionDate: data.actualCompletionDate ? new Date(data.actualCompletionDate) : undefined,
      };

      if (editingRequest) {
        await updateRepairRequestService(editingRequest.id, requestPayload);
        toast({ title: "Successo", description: "Richiesta di riparazione modificata." });
      } else {
        // Per addRepairRequestService, createdAt è gestito dal servizio
        await addRepairRequestService(requestPayload as Omit<RepairRequest, 'id' | 'createdAt' | 'updatedAt'>);
        toast({ title: "Successo", description: "Richiesta di riparazione aggiunta." });
      }
      await fetchAdminRepairRequests();
      resetFormStates();
    } catch (error: any) {
      console.error("Errore nel salvataggio della richiesta di riparazione:", error);
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

  const handleEditClick = (request: RepairRequest) => {
    setEditingRequest(request);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirmation = (request: RepairRequest) => {
    setRequestToDelete(request);
  };

  const executeDelete = async () => {
    if (requestToDelete) {
      try {
        await deleteRepairRequestService(requestToDelete.id);
        toast({ title: "Successo", description: `Richiesta riparazione ID "${requestToDelete.id}" eliminata.` });
        await fetchAdminRepairRequests();
        setRequestToDelete(null);
      } catch (error: any) {
        console.error("Errore nell'eliminazione:", error);
        toast({ title: "Errore", description: error.message || "Impossibile eliminare.", variant: "destructive" });
      }
    }
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredRequests = repairRequestsList.filter(req =>
    req.id.toLowerCase().includes(searchTerm) ||
    req.name.toLowerCase().includes(searchTerm) ||
    req.email.toLowerCase().includes(searchTerm) ||
    req.watchBrand.toLowerCase().includes(searchTerm) ||
    req.watchModel.toLowerCase().includes(searchTerm) ||
    req.status.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gestione Riparazioni</h1>
          <p className="text-muted-foreground mt-1">Visualizza e gestisci le richieste di riparazione.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetFormStates();
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNewClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-5 w-5" />
              Aggiungi Richiesta Rip.
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl bg-card border-border/60 shadow-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogT className="font-headline text-2xl text-primary text-left">{editingRequest ? "Modifica Richiesta Riparazione" : "Nuova Richiesta Riparazione"}</DialogT>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Cliente</Label>
                  <Input id="name" {...register("name")} className="mt-1 bg-input" />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} className="mt-1 bg-input" />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Telefono</Label>
                  <Input id="phone" {...register("phone")} className="mt-1 bg-input" />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="watchBrand">Marca Orologio</Label>
                  <Input id="watchBrand" {...register("watchBrand")} className="mt-1 bg-input" />
                  {errors.watchBrand && <p className="text-sm text-destructive mt-1">{errors.watchBrand.message}</p>}
                </div>
                 <div>
                  <Label htmlFor="watchModel">Modello Orologio</Label>
                  <Input id="watchModel" {...register("watchModel")} className="mt-1 bg-input" />
                  {errors.watchModel && <p className="text-sm text-destructive mt-1">{errors.watchModel.message}</p>}
                </div>
                 <div>
                  <Label htmlFor="watchSerialNumber">Seriale</Label>
                  <Input id="watchSerialNumber" {...register("watchSerialNumber")} className="mt-1 bg-input" />
                </div>
              </div>
              <div>
                <Label htmlFor="problemDescription">Descrizione Problema</Label>
                <Textarea id="problemDescription" {...register("problemDescription")} className="mt-1 bg-input min-h-[80px]" />
                {errors.problemDescription && <p className="text-sm text-destructive mt-1">{errors.problemDescription.message}</p>}
              </div>
              <div className="border-t border-border/40 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-primary">Gestione Interna</h3>
                 <div>
                    <Label htmlFor="status">Stato Richiesta</Label>
                    <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="status" className="mt-1 bg-input"><SelectValue placeholder="Seleziona stato" /></SelectTrigger>
                        <SelectContent className="bg-popover">
                            {AllRepairRequestStatuses.map(sVal => (<SelectItem key={sVal} value={sVal}>{sVal}</SelectItem>))}
                        </SelectContent>
                        </Select>
                    )} />
                    {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="quoteAmount">Preventivo (€)</Label>
                    <Input id="quoteAmount" type="number" step="0.01" {...register("quoteAmount")} className="mt-1 bg-input" />
                </div>
                <div>
                    <Label htmlFor="quoteDetails">Dettagli Preventivo</Label>
                    <Textarea id="quoteDetails" {...register("quoteDetails")} className="mt-1 bg-input min-h-[60px]" />
                </div>
                <div>
                    <Label htmlFor="adminNotes">Note Admin</Label>
                    <Textarea id="adminNotes" {...register("adminNotes")} className="mt-1 bg-input min-h-[80px]" />
                </div>
                {/* TODO: Date pickers per estimated/actual completion date */}
              </div>

              {editingRequest && (
                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                  <p>ID Richiesta: {editingRequest.id}</p>
                </div>
              )}

              <DialogFooter className="mt-2 pt-4 border-t border-border/40">
                <DialogClose asChild><Button type="button" variant="outline" onClick={resetFormStates}>Annulla</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingRequest ? "Salva Modifiche" : "Crea Richiesta"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card shadow-lg">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline text-xl text-primary">Elenco Richieste Riparazione</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cerca..." className="pl-9 w-full sm:w-[300px] bg-input" value={searchTerm} onChange={handleSearchChange} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 text-accent animate-spin" /></div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Orologio</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs">{req.id.substring(0,8)}...</TableCell>
                  <TableCell className="font-medium">{req.name}<br/><span className="text-xs text-muted-foreground">{req.email}</span></TableCell>
                  <TableCell>{req.watchBrand} {req.watchModel}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("font-normal", getStatusBadgeStyle(req.status))}>{req.status}</Badge></TableCell>
                  <TableCell>{format(new Date(req.createdAt), 'dd MMM yy', { locale: it })}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80" onClick={() => handleEditClick(req)}><Edit className="h-4 w-4" /><span className="sr-only">Modifica</span></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteConfirmation(req)}><Trash2 className="h-4 w-4" /><span className="sr-only">Elimina</span></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border/60">
                        <AlertDialogHeader><AlertDialogTitle className="text-primary">Sei sicuro?</AlertDialogTitle><AlertDialogDescription className="text-muted-foreground">Eliminare richiesta riparazione ID: {requestToDelete?.id}?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel onClick={() => setRequestToDelete(null)}>Annulla</AlertDialogCancel><AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Elimina</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{searchTerm ? `Nessuna richiesta per "${searchTerm}".` : "Nessuna richiesta."}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

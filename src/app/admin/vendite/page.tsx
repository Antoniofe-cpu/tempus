
// src/app/admin/vendite/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2, Loader2, Eye, DollarSign, Info, CheckSquare, XSquare, CalendarDays, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from '@/components/ui/checkbox';
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
import type { SellRequest, SellRequestStatus, WatchCondition } from '@/lib/types';
import { AllSellRequestStatuses, watchConditionOptions } from '@/lib/types';
import { getSellRequests, updateSellRequestService, deleteSellRequestService, addSellRequestService } from '@/services/sellRequestService';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const currentYear = new Date().getFullYear();
const SellRequestFormSchema = z.object({
  name: z.string().min(2, "Il nome è obbligatorio."),
  email: z.string().email("Email non valida."),
  phone: z.string().optional(),
  watchBrand: z.string().min(1, "Marca obbligatoria."),
  watchModel: z.string().min(1, "Modello obbligatorio."),
  watchYear: z.coerce.number().int().min(1900).max(currentYear).optional().nullable(),
  watchCondition: z.enum(watchConditionOptions),
  hasBox: z.boolean().default(false),
  hasPapers: z.boolean().default(false),
  desiredPrice: z.coerce.number().min(0).optional().nullable(),
  additionalInfo: z.string().optional(),
  status: z.enum(AllSellRequestStatuses),
  adminNotes: z.string().optional(),
  offerAmount: z.coerce.number().min(0).optional().nullable(),
});

type SellRequestFormData = z.infer<typeof SellRequestFormSchema>;

const getStatusBadgeStyle = (status?: SellRequestStatus): string => {
  // Adattare gli stili per SellRequestStatus se necessario
  switch (status) {
    case 'Nuova Proposta': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-600';
    case 'In Valutazione': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-700/30 dark:text-purple-300 dark:border-purple-600';
    case 'In Trattativa': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-600';
    case 'Offerta Inviata': return 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-700/30 dark:text-cyan-300 dark:border-cyan-600';
    case 'Accettata dal Cliente': return 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-700/30 dark:text-lime-300 dark:border-lime-600';
    case 'Rifiutata dal Cliente': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-700/30 dark:text-orange-300 dark:border-orange-600';
    case 'In Attesa Ricezione Orologio': return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-700/30 dark:text-indigo-300 dark:border-indigo-600';
    case 'Orologio Ricevuto e Verificato': return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-700/30 dark:text-sky-300 dark:border-sky-600';
    case 'Pagamento Effettuato': return 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-700/30 dark:text-teal-300 dark:border-teal-600';
    case 'Conclusa': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600';
    case 'Cancellata': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-700/30 dark:text-red-300 dark:border-red-600';
    default: return 'bg-gray-200 text-gray-700 border-gray-400 dark:bg-gray-600/30 dark:text-gray-400 dark:border-gray-500';
  }
};

export default function AdminVenditePage() {
  const [sellRequestsList, setSellRequestsList] = useState<SellRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<SellRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestToDelete, setRequestToDelete] = useState<SellRequest | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<SellRequestFormData>({
    resolver: zodResolver(SellRequestFormSchema),
    defaultValues: { status: 'Nuova Proposta' }
  });

  const fetchAdminSellRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const requests = await getSellRequests();
      setSellRequestsList(requests);
    } catch (error) {
      console.error("Errore nel caricamento delle proposte di vendita:", error);
      toast({ title: "Errore", description: `Impossibile caricare le proposte: ${(error as Error).message}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdminSellRequests();
  }, [fetchAdminSellRequests]);
  
  useEffect(() => {
    if (isDialogOpen) {
      if (editingRequest) {
        reset({
          ...editingRequest,
          watchYear: editingRequest.watchYear ?? null,
          desiredPrice: editingRequest.desiredPrice ?? null,
          offerAmount: editingRequest.offerAmount ?? null,
          adminNotes: editingRequest.adminNotes ?? '',
        });
      } else {
        reset({
          name: '', email: '', phone: '', watchBrand: '', watchModel: '',
          watchYear: null, watchCondition: undefined, hasBox: false, hasPapers: false,
          desiredPrice: null, additionalInfo: '', status: 'Nuova Proposta', adminNotes: '', offerAmount: null
        });
      }
    }
  }, [isDialogOpen, editingRequest, reset]);

  const onSubmit = async (data: SellRequestFormData) => {
    try {
      const requestPayload = {
        ...data,
        watchYear: data.watchYear ?? undefined,
        desiredPrice: data.desiredPrice ?? undefined,
        offerAmount: data.offerAmount ?? undefined,
      };

      if (editingRequest) {
        await updateSellRequestService(editingRequest.id, requestPayload);
        toast({ title: "Successo", description: "Proposta di vendita modificata." });
      } else {
        // Aggiunta non prevista da questo form admin, ma schema lo permette.
        // Solitamente l'admin modifica, non crea qui.
        // await addSellRequestService(requestPayload as Omit<SellRequest, 'id' | 'createdAt' | 'updatedAt'>);
        // toast({ title: "Successo", description: "Proposta di vendita aggiunta." });
        console.warn("Tentativo di aggiungere una nuova proposta dall'admin, operazione non standard per questo form.")
        toast({ title: "Operazione non standard", description: "Le nuove proposte di vendita sono solitamente create dagli utenti.", variant: "default"});
      }
      await fetchAdminSellRequests();
      resetFormStates();
    } catch (error: any) {
      console.error("Errore nel salvataggio della proposta:", error);
      toast({ title: "Errore", description: error.message || "Impossibile salvare la proposta.", variant: "destructive" });
    }
  };

  const resetFormStates = () => {
    reset();
    setEditingRequest(null);
    setIsDialogOpen(false);
  };

  const handleEditClick = (request: SellRequest) => {
    setEditingRequest(request);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirmation = (request: SellRequest) => {
    setRequestToDelete(request);
  };

  const executeDelete = async () => {
    if (requestToDelete) {
      try {
        await deleteSellRequestService(requestToDelete.id);
        toast({ title: "Successo", description: `Proposta di vendita ID "${requestToDelete.id}" eliminata.` });
        await fetchAdminSellRequests();
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

  const filteredRequests = sellRequestsList.filter(req =>
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
          <h1 className="font-headline text-4xl font-bold text-primary">Gestione Proposte di Vendita</h1>
          <p className="text-muted-foreground mt-1">Visualizza e gestisci le proposte di vendita degli utenti.</p>
        </div>
        {/* Bottone Aggiungi rimosso perché l'admin modifica, non crea qui */}
      </div>

      <Card className="bg-card shadow-lg">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline text-xl text-primary">Elenco Proposte di Vendita</CardTitle>
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
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Orologio</TableHead>
                <TableHead>Prezzo Des.</TableHead>
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
                  <TableCell>{req.watchBrand} {req.watchModel} ({req.watchYear || 'N/A'})</TableCell>
                  <TableCell>{req.desiredPrice ? `€${req.desiredPrice.toLocaleString('it-IT')}` : 'N/D'}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("font-normal", getStatusBadgeStyle(req.status))}>{req.status}</Badge></TableCell>
                  <TableCell>{format(new Date(req.createdAt), 'dd MMM yy', { locale: it })}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80" onClick={() => handleEditClick(req)}><Edit className="h-4 w-4" /><span className="sr-only">Modifica</span></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteConfirmation(req)}><Trash2 className="h-4 w-4" /><span className="sr-only">Elimina</span></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border/60">
                        <AlertDialogHeader><AlertDialogTitle className="text-primary">Sei sicuro?</AlertDialogTitle><AlertDialogDescription className="text-muted-foreground">Eliminare proposta di vendita ID: {requestToDelete?.id}?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel onClick={() => setRequestToDelete(null)}>Annulla</AlertDialogCancel><AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Elimina</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{searchTerm ? `Nessuna proposta per "${searchTerm}".` : "Nessuna proposta."}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetFormStates(); }}>
        <DialogContent className="sm:max-w-3xl bg-card border-border/60 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogT className="font-headline text-2xl text-primary text-left">Gestisci Proposta di Vendita</DialogT>
            <DialogDesc className="text-muted-foreground text-left">ID Proposta: {editingRequest?.id}</DialogDesc>
          </DialogHeader>
          {editingRequest && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4 px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 rounded-md border border-dashed border-border/50">
                  <div><Info className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Cliente:</strong> {editingRequest.name} ({editingRequest.email})</div>
                  <div><ShoppingCart className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Orologio:</strong> {editingRequest.watchBrand} {editingRequest.watchModel}</div>
                  <div><CalendarDays className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Anno:</strong> {editingRequest.watchYear || 'N/D'}</div>
                  <div><Info className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Condizione:</strong> {editingRequest.watchCondition}</div>
                  <div className="flex items-center gap-2">{editingRequest.hasBox ? <CheckSquare className="h-4 w-4 text-green-500"/> : <XSquare className="h-4 w-4 text-red-500"/>} Scatola Originale</div>
                  <div className="flex items-center gap-2">{editingRequest.hasPapers ? <CheckSquare className="h-4 w-4 text-green-500"/> : <XSquare className="h-4 w-4 text-red-500"/>} Documenti Originali</div>
                  <div><DollarSign className="inline h-4 w-4 mr-1 text-muted-foreground"/><strong>Prezzo Desiderato:</strong> {editingRequest.desiredPrice ? `€${editingRequest.desiredPrice.toLocaleString('it-IT')}` : 'N/D'}</div>
                  {editingRequest.additionalInfo && <div className="md:col-span-2"><strong className="text-muted-foreground">Info Aggiuntive:</strong> <p className="text-sm whitespace-pre-wrap">{editingRequest.additionalInfo}</p></div>}
              </div>

              <div className="border-t border-border/40 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-primary">Gestione Interna Proposta</h3>
                 <div>
                    <Label htmlFor="statusAdmin">Stato Proposta</Label>
                    <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="statusAdmin" className="mt-1 bg-input"><SelectValue placeholder="Seleziona stato" /></SelectTrigger>
                        <SelectContent className="bg-popover">
                            {AllSellRequestStatuses.map(sVal => (<SelectItem key={sVal} value={sVal}>{sVal}</SelectItem>))}
                        </SelectContent>
                        </Select>
                    )} />
                    {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="offerAmountAdmin">Offerta Tempus (€)</Label>
                    <Input id="offerAmountAdmin" type="number" step="0.01" {...register("offerAmount")} className="mt-1 bg-input" />
                    {errors.offerAmount && <p className="text-sm text-destructive mt-1">{errors.offerAmount.message}</p>}
                </div>
                <div>
                    <Label htmlFor="adminNotesAdmin">Note Admin</Label>
                    <Textarea id="adminNotesAdmin" {...register("adminNotes")} className="mt-1 bg-input min-h-[80px]" />
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground pt-2">
                <p>Data Creazione: {format(new Date(editingRequest.createdAt), 'dd/MM/yyyy HH:mm', { locale: it })}</p>
                {editingRequest.updatedAt && <p>Ultima Modifica: {format(new Date(editingRequest.updatedAt), 'dd/MM/yyyy HH:mm', { locale: it })}</p>}
              </div>

              <DialogFooter className="mt-2 pt-4 border-t border-border/40">
                <DialogClose asChild><Button type="button" variant="outline" onClick={resetFormStates}>Annulla</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Salva Modifiche</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

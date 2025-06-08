
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogDesc,
  DialogFooter,
  DialogHeader,
  DialogTitle as DialogT,
  DialogClose,
  DialogTrigger, // Added DialogTrigger
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Watch as WatchType } from '@/lib/types';
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
import { getWatches, addWatchService, updateWatchService, deleteWatchService, populateFirestoreWithMockDataIfNeeded } from '@/services/watchService';
import { useToast } from "@/hooks/use-toast";


const WatchFormSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  brand: z.string().min(2, { message: "La marca deve contenere almeno 2 caratteri." }),
  price: z.coerce.number().positive({ message: "Il prezzo deve essere un numero positivo." }),
  stock: z.coerce.number().int().min(0, { message: "La disponibilità non può essere negativa." }),
  imageUrl: z.string().url({ message: "Inserisci un URL valido per l'immagine." }).optional().or(z.literal('')),
  description: z.string().min(5, { message: "La descrizione deve contenere almeno 5 caratteri." }),
  dataAiHint: z.string().max(30, { message: "L'hint AI non può superare 30 caratteri." }).optional().default(''),
  rarity: z.string().optional().default(''),
  condition: z.string().optional().default(''),
  isNewArrival: z.boolean().default(false),
});

type WatchFormData = z.infer<typeof WatchFormSchema>;

export default function AdminOrologiPage() {
  const [watchesList, setWatchesList] = useState<WatchType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWatch, setEditingWatch] = useState<WatchType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [watchToDelete, setWatchToDelete] = useState<WatchType | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<WatchFormData>({
    resolver: zodResolver(WatchFormSchema),
    defaultValues: {
      name: '',
      brand: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      description: '',
      dataAiHint: '',
      rarity: '',
      condition: '',
      isNewArrival: false,
    }
  });

  const fetchAdminWatches = useCallback(async () => {
    setIsLoading(true);
    try {
      await populateFirestoreWithMockDataIfNeeded();
      const watches = await getWatches();
      setWatchesList(watches);
    } catch (error) {
      console.error("Errore nel caricamento degli orologi:", error);
      toast({ title: "Errore", description: "Impossibile caricare gli orologi da Firestore.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdminWatches();
  }, [fetchAdminWatches]);
  
  useEffect(() => {
    if (isDialogOpen) {
      if (editingWatch) {
        reset({
          ...editingWatch,
          price: editingWatch.price || 0,
          stock: editingWatch.stock || 0,
          imageUrl: editingWatch.imageUrl || 'https://placehold.co/600x400.png',
          dataAiHint: editingWatch.dataAiHint || '',
          rarity: editingWatch.rarity || '',
          condition: editingWatch.condition || '',
          isNewArrival: editingWatch.isNewArrival || false,
        });
      } else {
        reset({ 
            name: '',
            brand: '',
            price: 0,
            stock: 0,
            imageUrl: 'https://placehold.co/600x400.png',
            description: '',
            dataAiHint: '',
            rarity: '',
            condition: '',
            isNewArrival: false,
        });
      }
    }
  }, [isDialogOpen, editingWatch, reset]);


  const onSubmit = async (data: WatchFormData) => {
    console.log('Dati del form prima dell\'invio:', data);
    try {
      const watchPayload = {
        name: data.name,
        brand: data.brand,
        price: Number(data.price),
        stock: Number(data.stock),
        description: data.description,
        imageUrl: data.imageUrl || `https://placehold.co/600x400.png`,
        dataAiHint: data.dataAiHint || data.name.split(" ").slice(0,2).join(" ").toLowerCase() || 'orologio generico',
        rarity: data.rarity || '',
        condition: data.condition || '',
        isNewArrival: data.isNewArrival,
      };

      if (editingWatch) {
        console.log('Tentativo di MODIFICA orologio con ID:', editingWatch.id, 'Payload:', watchPayload);
        await updateWatchService(editingWatch.id, watchPayload);
        toast({ title: "Successo", description: "Orologio modificato con successo." });
      } else {
        console.log('Tentativo di AGGIUNTA nuovo orologio. Payload:', watchPayload);
        await addWatchService(watchPayload as Omit<WatchType, 'id'>); 
        toast({ title: "Successo", description: "Orologio aggiunto con successo." });
      }
      await fetchAdminWatches(); 
      resetFormStates();
    } catch (error: any) {
      console.error("Errore onSubmit nel salvataggio dell'orologio:", error);
      const errorMessage = error.message || "Impossibile salvare l'orologio su Firestore. Controlla la console per dettagli.";
      toast({ title: "Errore", description: errorMessage, variant: "destructive" });
    }
  };

  const resetFormStates = () => {
    reset();
    setEditingWatch(null);
    setIsDialogOpen(false);
  }

  const handleAddNewClick = () => {
    setEditingWatch(null);
    reset({ 
      name: '',
      brand: '',
      price: 0,
      stock: 0,
      imageUrl: 'https://placehold.co/600x400.png',
      description: '',
      dataAiHint: '',
      rarity: '',
      condition: '',
      isNewArrival: false,
    }); 
    setIsDialogOpen(true);
  };

  const handleEditClick = (watch: WatchType) => {
    setEditingWatch(watch);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirmation = (watch: WatchType) => {
    setWatchToDelete(watch);
  };

  const executeDelete = async () => {
    if (watchToDelete) {
      try {
        await deleteWatchService(watchToDelete.id);
        toast({ title: "Successo", description: `Orologio "${watchToDelete.name}" eliminato.` });
        await fetchAdminWatches(); 
        setWatchToDelete(null);
      } catch (error: any) {
        console.error("Errore nell'eliminazione dell'orologio:", error);
        const errorMessage = error.message || "Impossibile eliminare l'orologio da Firestore.";
        toast({ title: "Errore", description: errorMessage, variant: "destructive" });
      }
    }
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredWatches = watchesList.filter(watch =>
    (watch.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (watch.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gestione Orologi</h1>
          <p className="text-muted-foreground mt-1">Aggiungi, modifica o rimuovi orologi dal catalogo Occasioni (dati su Firestore).</p>
        </div>
        <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) { 
                setEditingWatch(null);
                reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNewClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Aggiungi Orologio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-card border-border/60 shadow-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogT className="font-headline text-2xl text-primary text-left">{editingWatch ? "Modifica Orologio" : "Aggiungi Nuovo Orologio"}</DialogT>
                  <DialogDesc className="text-muted-foreground text-left">
                    {editingWatch ? "Modifica i dettagli dell'orologio esistente." : "Inserisci i dettagli del nuovo orologio da aggiungere al catalogo."}
                  </DialogDesc>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 px-0">
                  <div>
                    <Label htmlFor="name" className="text-foreground/80 block mb-1.5">Nome Orologio</Label>
                    <Input id="name" {...register("name")} className="bg-input border-border focus:border-accent focus:ring-accent" />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="brand" className="text-foreground/80 block mb-1.5">Marca</Label>
                    <Input id="brand" {...register("brand")} className="bg-input border-border focus:border-accent focus:ring-accent" />
                    {errors.brand && <p className="text-sm text-destructive mt-1">{errors.brand.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-foreground/80 block mb-1.5">Prezzo (€)</Label>
                    <Input id="price" type="number" step="0.01" {...register("price")} className="bg-input border-border focus:border-accent focus:ring-accent" />
                    {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="stock" className="text-foreground/80 block mb-1.5">Disponibilità</Label>
                    <Input id="stock" type="number" step="1" {...register("stock")} className="bg-input border-border focus:border-accent focus:ring-accent" />
                    {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl" className="text-foreground/80 block mb-1.5">URL Immagine</Label>
                    <Input id="imageUrl" {...register("imageUrl")} placeholder="https://placehold.co/600x400.png" className="bg-input border-border focus:border-accent focus:ring-accent" />
                    {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="dataAiHint" className="text-foreground/80 block mb-1.5">Hint AI per Immagine (max 2 parole)</Label>
                    <Input id="dataAiHint" {...register("dataAiHint")} placeholder="es. rolex submariner" className="bg-input border-border focus:border-accent focus:ring-accent" />
                    {errors.dataAiHint && <p className="text-sm text-destructive mt-1">{errors.dataAiHint.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="rarity" className="text-foreground/80 block mb-1.5">Rarità (Opzionale)</Label>
                    <Input id="rarity" {...register("rarity")} placeholder="Es. Limited Edition" className="bg-input border-border focus:border-accent focus:ring-accent" />
                  </div>

                  <div>
                    <Label htmlFor="condition" className="text-foreground/80 block mb-1.5">Condizione (Opzionale)</Label>
                    <Input id="condition" {...register("condition")} placeholder="Es. Nuovo, Mint" className="bg-input border-border focus:border-accent focus:ring-accent" />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-foreground/80 block mb-1.5">Descrizione</Label>
                    <Textarea id="description" {...register("description")} className="min-h-[100px] bg-input border-border focus:border-accent focus:ring-accent" />
                    {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input id="isNewArrival" type="checkbox" {...register("isNewArrival")} className="h-4 w-4 text-primary focus:ring-primary border-border rounded" />
                    <Label htmlFor="isNewArrival" className="text-foreground/80">Segna come "Nuovo Arrivo"</Label>
                    {errors.isNewArrival && <p className="text-sm text-destructive mt-1">{errors.isNewArrival.message}</p>}
                  </div>


                  <DialogFooter className="mt-2 pt-4 border-t border-border/40">
                    <DialogClose asChild>
                       <Button type="button" variant="outline" onClick={resetFormStates}>Annulla</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingWatch ? "Salva Modifiche" : "Salva Orologio"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card className="bg-card shadow-lg">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline text-xl text-primary">Catalogo Orologi (Firestore)</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cerca per nome o marca..." 
                className="pl-9 w-full sm:w-[250px] bg-input" 
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
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nome Orologio</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead>Disponibilità</TableHead>
                <TableHead>Nuovo Arrivo</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWatches.length > 0 ? filteredWatches.map((watch) => (
                <TableRow key={watch.id}>
                  <TableCell>
                    <Image 
                        src={watch.imageUrl || 'https://placehold.co/40x40.png'} 
                        alt={watch.name || 'Orologio'} 
                        width={40} 
                        height={40} 
                        className="rounded-md object-cover" 
                        data-ai-hint={watch.dataAiHint || (watch.name || '').split(" ").slice(0,2).join(" ").toLowerCase()}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/40x40.png'; 
                          e.currentTarget.srcset = '';
                        }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{watch.name}</TableCell>
                  <TableCell>{watch.brand}</TableCell>
                  <TableCell>€{(watch.price || 0).toLocaleString('it-IT')}</TableCell>
                  <TableCell>{(watch.stock || 0) > 0 ? `${watch.stock} pz.` : <span className="text-destructive">Esaurito</span>}</TableCell>
                  <TableCell>{watch.isNewArrival ? 'Sì' : 'No'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80" onClick={() => handleEditClick(watch)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Modifica</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteConfirmation(watch)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Elimina</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border/60">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-primary">Sei sicuro?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Questa azione non può essere annullata. L'orologio "{watchToDelete?.name}" verrà eliminato permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setWatchToDelete(null)} className="hover:bg-muted/50">Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Elimina</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm ? `Nessun orologio trovato per "${searchTerm}".` :
                    (isLoading ? "Caricamento orologi..." : "Nessun orologio nel catalogo. Inizia aggiungendone uno o popola Firestore!")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        I dati degli orologi sono ora gestiti tramite Firestore. Assicurati di aver configurato correttamente `src/lib/firebase.ts` e le regole di sicurezza di Firestore.
        La funzione `populateFirestoreWithMockDataIfNeeded()` viene chiamata all'avvio per popolare il database con dati di esempio, se vuoto.
      </p>
    </div>
  );
}



    

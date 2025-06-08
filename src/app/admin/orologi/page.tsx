
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm, Controller } from 'react-hook-form';
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
} from "@/components/ui/alert-dialog";
import { getWatches, addWatchService, updateWatchService, deleteWatchService, populateFirestoreWithMockDataIfNeeded } from '@/services/watchService';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '@/components/ui/checkbox'; // Aggiunto Checkbox

const currentYear = new Date().getFullYear();

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

  referenceNumber: z.string().optional(),
  caseMaterial: z.string().optional(),
  caseDiameter: z.string().optional(),
  caseThickness: z.string().optional(),
  waterResistance: z.string().optional(),
  movementType: z.string().optional(),
  caliber: z.string().optional(),
  powerReserve: z.string().optional(),
  dialColor: z.string().optional(),
  dialMarkers: z.string().optional(),
  braceletMaterial: z.string().optional(),
  claspType: z.string().optional(),
  functions: z.string().optional(), // Stringa separata da virgole, verrà convertita in array
  additionalImageUrls: z.string().optional(), // Stringa separata da a capo, verrà convertita in array
  yearOfProduction: z.coerce.number().int().min(1800).max(currentYear).optional().nullable(),
  complications: z.string().optional(), // Stringa separata da virgole
  crystalType: z.string().optional(),
  lugWidth: z.string().optional(),
  bezelMaterial: z.string().optional(),
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

  const { register, handleSubmit, reset, formState: { errors }, control, setValue } = useForm<WatchFormData>({
    resolver: zodResolver(WatchFormSchema),
    defaultValues: {
      name: '', brand: '', price: 0, stock: 0, imageUrl: '', description: '',
      dataAiHint: '', rarity: '', condition: '', isNewArrival: false,
      referenceNumber: '', caseMaterial: '', caseDiameter: '', caseThickness: '', waterResistance: '',
      movementType: '', caliber: '', powerReserve: '', dialColor: '', dialMarkers: '',
      braceletMaterial: '', claspType: '', functions: '', additionalImageUrls: '',
      yearOfProduction: undefined, complications: '', crystalType: '', lugWidth: '', bezelMaterial: '',
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
          functions: editingWatch.functions?.join(', ') || '',
          additionalImageUrls: editingWatch.additionalImageUrls?.join('\n') || '',
          complications: editingWatch.complications?.join(', ') || '',
          yearOfProduction: editingWatch.yearOfProduction ?? undefined,
        });
      } else {
         reset({ // Reset to default values for new watch
            name: '', brand: '', price: 0, stock: 0,
            imageUrl: 'https://placehold.co/600x400.png', description: '',
            dataAiHint: '', rarity: '', condition: '', isNewArrival: false,
            referenceNumber: '', caseMaterial: '', caseDiameter: '', caseThickness: '', waterResistance: '',
            movementType: '', caliber: '', powerReserve: '', dialColor: '', dialMarkers: '',
            braceletMaterial: '', claspType: '', functions: '', additionalImageUrls: '',
            yearOfProduction: undefined, complications: '', crystalType: '', lugWidth: '', bezelMaterial: '',
        });
      }
    }
  }, [isDialogOpen, editingWatch, reset]);


  const onSubmit = async (data: WatchFormData) => {
    try {
      const functionsArray = data.functions ? data.functions.split(',').map(f => f.trim()).filter(f => f) : undefined;
      const complicationsArray = data.complications ? data.complications.split(',').map(c => c.trim()).filter(c => c) : undefined;
      const additionalImageUrlsArray = data.additionalImageUrls ? data.additionalImageUrls.split('\n').map(url => url.trim()).filter(url => url) : undefined;

      const watchPayload = {
        name: data.name,
        brand: data.brand,
        price: Number(data.price),
        stock: Number(data.stock),
        description: data.description,
        imageUrl: data.imageUrl || `https://placehold.co/600x400.png`,
        dataAiHint: data.dataAiHint || data.name.split(" ").slice(0,2).join(" ").toLowerCase() || 'orologio generico',
        rarity: data.rarity,
        condition: data.condition,
        isNewArrival: data.isNewArrival,
        referenceNumber: data.referenceNumber,
        caseMaterial: data.caseMaterial,
        caseDiameter: data.caseDiameter,
        caseThickness: data.caseThickness,
        waterResistance: data.waterResistance,
        movementType: data.movementType,
        caliber: data.caliber,
        powerReserve: data.powerReserve,
        dialColor: data.dialColor,
        dialMarkers: data.dialMarkers,
        braceletMaterial: data.braceletMaterial,
        claspType: data.claspType,
        functions: functionsArray,
        additionalImageUrls: additionalImageUrlsArray,
        yearOfProduction: data.yearOfProduction ?? undefined,
        complications: complicationsArray,
        crystalType: data.crystalType,
        lugWidth: data.lugWidth,
        bezelMaterial: data.bezelMaterial,
      };

      // Rimuovi chiavi con valore undefined dal payload per evitare problemi con Firestore
      Object.keys(watchPayload).forEach(key => {
        const k = key as keyof typeof watchPayload;
        if (watchPayload[k] === undefined || watchPayload[k] === '') {
          delete watchPayload[k];
        }
      });


      if (editingWatch) {
        await updateWatchService(editingWatch.id, watchPayload as Partial<Omit<WatchType, 'id'>>);
        toast({ title: "Successo", description: "Orologio modificato con successo." });
      } else {
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
    reset({ // Assicurati che tutti i campi siano resettati
        name: '', brand: '', price: 0, stock: 0,
        imageUrl: 'https://placehold.co/600x400.png', description: '',
        dataAiHint: '', rarity: '', condition: '', isNewArrival: false,
        referenceNumber: '', caseMaterial: '', caseDiameter: '', caseThickness: '', waterResistance: '',
        movementType: '', caliber: '', powerReserve: '', dialColor: '', dialMarkers: '',
        braceletMaterial: '', claspType: '', functions: '', additionalImageUrls: '',
        yearOfProduction: undefined, complications: '', crystalType: '', lugWidth: '', bezelMaterial: '',
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
          <p className="text-muted-foreground mt-1">Aggiungi, modifica o rimuovi orologi dal catalogo.</p>
        </div>
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
          <DialogContent className="sm:max-w-2xl bg-card border-border/60 shadow-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogT className="font-headline text-2xl text-primary text-left">{editingWatch ? "Modifica Orologio" : "Aggiungi Nuovo Orologio"}</DialogT>
              <DialogDesc className="text-muted-foreground text-left">
                {editingWatch ? "Modifica i dettagli dell'orologio esistente." : "Inserisci i dettagli del nuovo orologio da aggiungere al catalogo."}
              </DialogDesc>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 px-1"> {/* Reduced padding for more space */}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Orologio</Label>
                  <Input id="name" {...register("name")} className="mt-1 bg-input"/>
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" {...register("brand")} className="mt-1 bg-input"/>
                  {errors.brand && <p className="text-sm text-destructive mt-1">{errors.brand.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Prezzo (€)</Label>
                  <Input id="price" type="number" step="0.01" {...register("price")} className="mt-1 bg-input"/>
                  {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <Label htmlFor="stock">Disponibilità</Label>
                  <Input id="stock" type="number" step="1" {...register("stock")} className="mt-1 bg-input"/>
                  {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="imageUrl">URL Immagine Principale</Label>
                <Input id="imageUrl" {...register("imageUrl")} placeholder="https://placehold.co/600x400.png" className="mt-1 bg-input"/>
                {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
              </div>

              <div>
                <Label htmlFor="additionalImageUrls">URL Immagini Aggiuntive (una per riga)</Label>
                <Textarea id="additionalImageUrls" {...register("additionalImageUrls")} className="mt-1 min-h-[80px] bg-input" placeholder="https://placehold.co/600x400_1.png&#10;https://placehold.co/600x400_2.png"/>
                {errors.additionalImageUrls && <p className="text-sm text-destructive mt-1">{errors.additionalImageUrls.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataAiHint">Hint AI Immagine (max 2 parole)</Label>
                  <Input id="dataAiHint" {...register("dataAiHint")} placeholder="es. rolex submariner" className="mt-1 bg-input"/>
                  {errors.dataAiHint && <p className="text-sm text-destructive mt-1">{errors.dataAiHint.message}</p>}
                </div>
                <div>
                  <Label htmlFor="rarity">Rarità</Label>
                  <Input id="rarity" {...register("rarity")} placeholder="Es. Limited Edition" className="mt-1 bg-input"/>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition">Condizione</Label>
                  <Input id="condition" {...register("condition")} placeholder="Es. Nuovo, Mint" className="mt-1 bg-input"/>
                </div>
                <div>
                  <Label htmlFor="yearOfProduction">Anno di Produzione</Label>
                  <Input id="yearOfProduction" type="number" {...register("yearOfProduction")} placeholder={`Es. ${currentYear}`} className="mt-1 bg-input"/>
                  {errors.yearOfProduction && <p className="text-sm text-destructive mt-1">{errors.yearOfProduction.message}</p>}
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2 text-primary">Caratteristiche Dettagliate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                    <div><Label htmlFor="referenceNumber">Referenza</Label><Input id="referenceNumber" {...register("referenceNumber")} className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="caseMaterial">Materiale Cassa</Label><Input id="caseMaterial" {...register("caseMaterial")} className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="caseDiameter">Diametro Cassa</Label><Input id="caseDiameter" {...register("caseDiameter")} placeholder="Es. 40mm" className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="caseThickness">Spessore Cassa</Label><Input id="caseThickness" {...register("caseThickness")} placeholder="Es. 12.5mm" className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="waterResistance">Impermeabilità</Label><Input id="waterResistance" {...register("waterResistance")} placeholder="Es. 100m" className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="bezelMaterial">Materiale Lunetta</Label><Input id="bezelMaterial" {...register("bezelMaterial")} className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="crystalType">Vetro</Label><Input id="crystalType" {...register("crystalType")} placeholder="Es. Zaffiro" className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="dialColor">Colore Quadrante</Label><Input id="dialColor" {...register("dialColor")} className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="dialMarkers">Indici Quadrante</Label><Input id="dialMarkers" {...register("dialMarkers")} placeholder="Es. Indici a bastone" className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="movementType">Movimento</Label><Input id="movementType" {...register("movementType")} placeholder="Es. Automatico" className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="caliber">Calibro</Label><Input id="caliber" {...register("caliber")} className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="powerReserve">Riserva di Carica</Label><Input id="powerReserve" {...register("powerReserve")} placeholder="Es. 70 ore" className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="braceletMaterial">Materiale Cinturino</Label><Input id="braceletMaterial" {...register("braceletMaterial")} className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="lugWidth">Larghezza Anse</Label><Input id="lugWidth" {...register("lugWidth")} placeholder="Es. 20mm" className="mt-1 bg-input"/></div>
                    <div><Label htmlFor="claspType">Chiusura</Label><Input id="claspType" {...register("claspType")} className="mt-1 bg-input"/></div>
                </div>
                <div className="mt-3"><Label htmlFor="functions">Funzioni (separate da virgola)</Label><Textarea id="functions" {...register("functions")} className="mt-1 bg-input min-h-[60px]" placeholder="Es. Cronografo, Data, GMT"/></div>
                <div className="mt-3"><Label htmlFor="complications">Complicazioni (separate da virgola)</Label><Textarea id="complications" {...register("complications")} className="mt-1 bg-input min-h-[60px]" placeholder="Es. Fasi Lunari, Tourbillon"/></div>
              </div>
              
              <div className="mt-3">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea id="description" {...register("description")} className="mt-1 min-h-[100px] bg-input" />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Controller
                    name="isNewArrival"
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            id="isNewArrival"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                        />
                    )}
                />
                <Label htmlFor="isNewArrival" className="text-foreground/80 font-normal">Segna come "Nuovo Arrivo"</Label>
                {errors.isNewArrival && <p className="text-sm text-destructive mt-1">{errors.isNewArrival.message}</p>}
              </div>

              <DialogFooter className="mt-4 pt-4 border-t border-border/40">
                <DialogClose asChild>
                   <Button type="button" variant="outline" onClick={resetFormStates}>Annulla</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingWatch ? "Salva Modifiche" : "Salva Orologio"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchTerm ? `Nessun orologio trovato per "${searchTerm}".` :
                    (isLoading ? "Caricamento orologi..." : "Nessun orologio nel catalogo.")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        I dati degli orologi sono gestiti tramite Firestore.
      </p>
    </div>
  );
}

    
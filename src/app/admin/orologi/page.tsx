
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
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
  DialogTrigger,
  DialogClose,
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

const initialMockWatches: WatchType[] = [
  { id: "WR001", name: "Rolex Submariner Date", brand: "Rolex", price: 13500, stock: 2, imageUrl: "https://placehold.co/40x40.png", dataAiHint: "Rolex Submariner", description: "Iconico orologio subacqueo, un classico intramontabile." },
  { id: "WO002", name: "Omega Speedmaster Pro", brand: "Omega", price: 7200, stock: 5, imageUrl: "https://placehold.co/40x40.png", dataAiHint: "Omega Speedmaster", description: "Il leggendario Moonwatch, ricco di storia." },
  { id: "WPP003", name: "Patek Philippe Nautilus", brand: "Patek Philippe", price: 150000, stock: 1, imageUrl: "https://placehold.co/40x40.png", dataAiHint: "Patek Nautilus", description: "Eleganza sportiva e design inconfondibile." },
  { id: "WAP004", name: "Audemars Piguet Royal Oak", brand: "Audemars Piguet", price: 55000, stock: 2, imageUrl: "https://placehold.co/40x40.png", dataAiHint: "Audemars RoyalOak", description: "Design audace e finiture impeccabili per un orologio che non passa inosservato." },
];

const WatchFormSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  brand: z.string().min(2, { message: "La marca deve contenere almeno 2 caratteri." }),
  price: z.coerce.number().positive({ message: "Il prezzo deve essere un numero positivo." }),
  stock: z.coerce.number().int().min(0, { message: "La disponibilità non può essere negativa." }),
  imageUrl: z.string().url({ message: "Inserisci un URL valido per l'immagine." }).optional().or(z.literal('')),
  description: z.string().min(5, { message: "La descrizione deve contenere almeno 5 caratteri." }),
  dataAiHint: z.string().max(30, { message: "L'hint AI non può superare 30 caratteri." }).optional(),
});

type WatchFormData = z.infer<typeof WatchFormSchema>;

export default function AdminOrologiPage() {
  const [watchesList, setWatchesList] = useState<WatchType[]>(initialMockWatches);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWatch, setEditingWatch] = useState<WatchType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [watchToDelete, setWatchToDelete] = useState<WatchType | null>(null);

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
    }
  });

  useEffect(() => {
    if (isDialogOpen) {
      if (editingWatch) {
        reset(editingWatch);
      } else {
        reset({ // Reset to default empty values for new watch
            name: '',
            brand: '',
            price: 0,
            stock: 0,
            imageUrl: '',
            description: '',
            dataAiHint: '',
        });
      }
    }
  }, [isDialogOpen, editingWatch, reset]);


  const onSubmit = (data: WatchFormData) => {
    if (editingWatch) {
      // Edit existing watch
      const updatedWatch: WatchType = {
        ...editingWatch,
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
        imageUrl: data.imageUrl || editingWatch.imageUrl || `https://placehold.co/40x40.png`,
        dataAiHint: data.dataAiHint || editingWatch.dataAiHint || data.name.split(" ").slice(0,2).join(" ").toLowerCase(),
      };
      setWatchesList(prev => prev.map(w => w.id === editingWatch.id ? updatedWatch : w));
    } else {
      // Add new watch
      const newWatch: WatchType = {
        ...data,
        id: `W${Date.now().toString().slice(-5)}`,
        price: Number(data.price),
        stock: Number(data.stock),
        imageUrl: data.imageUrl || `https://placehold.co/40x40.png`,
        dataAiHint: data.dataAiHint || data.name.split(" ").slice(0,2).join(" ").toLowerCase(),
      };
      setWatchesList(prev => [newWatch, ...prev]);
    }
    resetFormStates();
  };

  const resetFormStates = () => {
    reset();
    setEditingWatch(null);
    setIsDialogOpen(false);
  }

  const handleAddNewClick = () => {
    setEditingWatch(null);
    reset(); // Clear form for new entry
    setIsDialogOpen(true);
  };

  const handleEditClick = (watch: WatchType) => {
    setEditingWatch(watch);
    // useEffect will handle resetting the form with watch data when dialog opens
    setIsDialogOpen(true);
  };

  const handleDeleteConfirmation = (watch: WatchType) => {
    setWatchToDelete(watch);
  };

  const executeDelete = () => {
    if (watchToDelete) {
      setWatchesList(prev => prev.filter(w => w.id !== watchToDelete.id));
      setWatchToDelete(null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredWatches = watchesList.filter(watch =>
    watch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    watch.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gestione Orologi</h1>
          <p className="text-muted-foreground mt-1">Aggiungi, modifica o rimuovi orologi dal catalogo Occasioni.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) { // If dialog is closing
            setEditingWatch(null);
            reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNewClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-5 w-5" />
              Aggiungi Nuovo Orologio
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
                <Input id="price" type="number" {...register("price")} className="bg-input border-border focus:border-accent focus:ring-accent" />
                {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="stock" className="text-foreground/80 block mb-1.5">Disponibilità</Label>
                <Input id="stock" type="number" {...register("stock")} className="bg-input border-border focus:border-accent focus:ring-accent" />
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
                <Label htmlFor="description" className="text-foreground/80 block mb-1.5">Descrizione</Label>
                <Textarea id="description" {...register("description")} className="min-h-[100px] bg-input border-border focus:border-accent focus:ring-accent" />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
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

      <Card className="bg-card shadow-lg">
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline text-xl text-primary">Catalogo Orologi</CardTitle>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nome Orologio</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead>Disponibilità</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWatches.length > 0 ? filteredWatches.map((watch) => (
                <TableRow key={watch.id}>
                  <TableCell>
                    <Image src={watch.imageUrl} alt={watch.name} width={40} height={40} className="rounded-md" data-ai-hint={watch.dataAiHint || watch.name.split(" ").slice(0,2).join(" ").toLowerCase()} />
                  </TableCell>
                  <TableCell className="font-medium">{watch.name}</TableCell>
                  <TableCell>{watch.brand}</TableCell>
                  <TableCell>€{watch.price.toLocaleString('it-IT')}</TableCell>
                  <TableCell>{watch.stock > 0 ? `${watch.stock} pz.` : <span className="text-destructive">Esaurito</span>}</TableCell>
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
                    {searchTerm ? `Nessun orologio trovato per "${searchTerm}".` : "Nessun orologio nel catalogo. Inizia aggiungendone uno!"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Le funzionalità di aggiunta, modifica, eliminazione e ricerca (per nome/marca) sono ora implementate.
      </p>
    </div>
  );
}
    

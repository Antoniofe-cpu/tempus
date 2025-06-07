
'use client';

import { useState } from 'react';
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
  DialogDescription as DialogDesc, // Renamed to avoid conflict with CardDescription
  DialogFooter,
  DialogHeader,
  DialogTitle as DialogT, // Renamed to avoid conflict with CardTitle
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Watch as WatchType } from '@/lib/types'; // Import Watch type

const initialMockWatches: WatchType[] = [
  { id: "WR001", name: "Rolex Submariner Date", brand: "Rolex", price: 13500, stock: 2, imageUrl: "https://placehold.co/40x40.png", dataAiHint: "Rolex Submariner", description: "Iconico orologio subacqueo, un classico intramontabile." },
  { id: "WO002", name: "Omega Speedmaster Pro", brand: "Omega", price: 7200, stock: 5, imageUrl: "https://placehold.co/40x40.png", dataAiHint: "Omega Speedmaster", description: "Il leggendario Moonwatch, ricco di storia." },
  { id: "WPP003", name: "Patek Philippe Nautilus", brand: "Patek Philippe", price: 150000, stock: 1, imageUrl: "https://placehold.co/40x40.png", dataAiHint: "Patek Nautilus", description: "Eleganza sportiva e design inconfondibile." },
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WatchFormData>({
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

  const onSubmit = (data: WatchFormData) => {
    const newWatch: WatchType = {
      ...data,
      id: `W${Date.now().toString().slice(-5)}`,
      imageUrl: data.imageUrl || `https://placehold.co/40x40.png`,
      dataAiHint: data.dataAiHint || data.name.split(" ").slice(0,2).join(" ").toLowerCase(),
    };
    setWatchesList(prev => [newWatch, ...prev]);
    reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gestione Orologi</h1>
          <p className="text-muted-foreground mt-1">Aggiungi, modifica o rimuovi orologi dal catalogo Occasioni.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-5 w-5" />
              Aggiungi Nuovo Orologio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border/60 shadow-xl">
            <DialogHeader>
              <DialogT className="font-headline text-2xl text-primary">Aggiungi Nuovo Orologio</DialogT>
              <DialogDesc className="text-muted-foreground">
                Inserisci i dettagli del nuovo orologio da aggiungere al catalogo.
              </DialogDesc>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              
              <div>
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <Label htmlFor="name" className="text-right text-foreground/80 col-span-1">Nome</Label>
                  <Input id="name" {...register("name")} className="col-span-3 bg-input border-border focus:border-accent focus:ring-accent" />
                </div>
                {errors.name && (
                  <div className="grid grid-cols-4 gap-x-4 mt-1">
                    <div className="col-span-1" /> {/* Spacer */}
                    <p className="col-span-3 text-sm text-destructive">{errors.name.message}</p>
                  </div>
                )}
              </div>
              
              <div>
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <Label htmlFor="brand" className="text-right text-foreground/80 col-span-1">Marca</Label>
                  <Input id="brand" {...register("brand")} className="col-span-3 bg-input border-border focus:border-accent focus:ring-accent" />
                </div>
                {errors.brand && (
                  <div className="grid grid-cols-4 gap-x-4 mt-1">
                     <div className="col-span-1" /> {/* Spacer */}
                    <p className="col-span-3 text-sm text-destructive">{errors.brand.message}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <Label htmlFor="price" className="text-right text-foreground/80 col-span-1">Prezzo (€)</Label>
                  <Input id="price" type="number" {...register("price")} className="col-span-3 bg-input border-border focus:border-accent focus:ring-accent" />
                </div>
                {errors.price && (
                  <div className="grid grid-cols-4 gap-x-4 mt-1">
                     <div className="col-span-1" /> {/* Spacer */}
                    <p className="col-span-3 text-sm text-destructive">{errors.price.message}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <Label htmlFor="stock" className="text-right text-foreground/80 col-span-1">Disponibilità</Label>
                  <Input id="stock" type="number" {...register("stock")} className="col-span-3 bg-input border-border focus:border-accent focus:ring-accent" />
                </div>
                {errors.stock && (
                  <div className="grid grid-cols-4 gap-x-4 mt-1">
                     <div className="col-span-1" /> {/* Spacer */}
                    <p className="col-span-3 text-sm text-destructive">{errors.stock.message}</p>
                  </div>
                )}
              </div>
              
              <div>
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <Label htmlFor="imageUrl" className="text-right text-foreground/80 col-span-1">URL Immagine</Label>
                  <Input id="imageUrl" {...register("imageUrl")} placeholder="https://placehold.co/40x40.png" className="col-span-3 bg-input border-border focus:border-accent focus:ring-accent" />
                </div>
                {errors.imageUrl && (
                  <div className="grid grid-cols-4 gap-x-4 mt-1">
                    <div className="col-span-1" /> {/* Spacer */}
                    <p className="col-span-3 text-sm text-destructive">{errors.imageUrl.message}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="grid grid-cols-4 items-center gap-x-4">
                  <Label htmlFor="dataAiHint" className="text-right text-foreground/80 col-span-1">Hint AI Img.</Label>
                  <Input id="dataAiHint" {...register("dataAiHint")} placeholder="es. rolex submariner" className="col-span-3 bg-input border-border focus:border-accent focus:ring-accent" />
                </div>
                {errors.dataAiHint && (
                  <div className="grid grid-cols-4 gap-x-4 mt-1">
                    <div className="col-span-1" /> {/* Spacer */}
                    <p className="col-span-3 text-sm text-destructive">{errors.dataAiHint.message}</p>
                  </div>
                )}
              </div>
              
              <div>
                <div className="grid grid-cols-4 items-start gap-x-4">
                  <Label htmlFor="description" className="text-right text-foreground/80 col-span-1 pt-2">Descrizione</Label>
                  <Textarea id="description" {...register("description")} className="col-span-3 min-h-[100px] bg-input border-border focus:border-accent focus:ring-accent" />
                </div>
                {errors.description && (
                  <div className="grid grid-cols-4 gap-x-4 mt-1">
                    <div className="col-span-1" /> {/* Spacer */}
                    <p className="col-span-3 text-sm text-destructive">{errors.description.message}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="mt-4 sm:mt-2">
                <DialogClose asChild>
                   <Button type="button" variant="outline" onClick={() => { reset(); setIsDialogOpen(false); }}>Annulla</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Salva Orologio</Button>
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
              <Input placeholder="Cerca orologi..." className="pl-9 w-full sm:w-[250px] bg-input" />
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
              {watchesList.length > 0 ? watchesList.map((watch) => (
                <TableRow key={watch.id}>
                  <TableCell>
                    <Image src={watch.imageUrl} alt={watch.name} width={40} height={40} className="rounded-md" data-ai-hint={watch.dataAiHint || watch.name.split(" ").slice(0,2).join(" ").toLowerCase()} />
                  </TableCell>
                  <TableCell className="font-medium">{watch.name}</TableCell>
                  <TableCell>{watch.brand}</TableCell>
                  <TableCell>€{watch.price.toLocaleString('it-IT')}</TableCell>
                  <TableCell>{watch.stock > 0 ? `${watch.stock} pz.` : <span className="text-destructive">Esaurito</span>}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Modifica</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                       <span className="sr-only">Elimina</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nessun orologio nel catalogo. Inizia aggiungendone uno!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Le funzionalità di ricerca, modifica ed eliminazione non sono ancora implementate.
      </p>
    </div>
  );
}
    

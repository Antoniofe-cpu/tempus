import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

const mockWatches = [
  { id: "WR001", name: "Rolex Submariner Date", brand: "Rolex", price: 13500, stock: 2, imageUrl: "https://placehold.co/40x40.png", dataAiHint: "Rolex Submariner" },
  { id: "WO002", name: "Omega Speedmaster Pro", brand: "Omega", price: 7200, stock: 5, imageUrl: "https://placehold.co/40x40.png", dataAiHint: "Omega Speedmaster" },
  { id: "WPP003", name: "Patek Philippe Nautilus", brand: "Patek Philippe", price: 150000, stock: 1, imageUrl: "https://placehold.co/40x40.png", dataAiHint: "Patek Nautilus"},
];

export default function AdminOrologiPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gestione Orologi</h1>
          <p className="text-muted-foreground mt-1">Aggiungi, modifica o rimuovi orologi dal catalogo Occasioni.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" />
          Aggiungi Nuovo Orologio
        </Button>
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
              {mockWatches.map((watch) => (
                <TableRow key={watch.id}>
                  <TableCell>
                    <Image src={watch.imageUrl} alt={watch.name} width={40} height={40} className="rounded-md" data-ai-hint={watch.dataAiHint} />
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Funzionalità di aggiunta e modifica dettagliata degli orologi non ancora implementate.
      </p>
    </div>
  );
}

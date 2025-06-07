
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockRequests = [
  { id: "REQ001", clientName: "Mario Rossi", watchType: "Sportivo", status: "Nuova", date: "2024-07-28" },
  { id: "REQ002", clientName: "Laura Bianchi", watchType: "Dress", status: "In Lavorazione", date: "2024-07-27" },
  { id: "REQ003", clientName: "Giuseppe Verdi", watchType: "Vintage", status: "Completata", date: "2024-07-25" },
  { id: "REQ004", clientName: "Anna Neri", watchType: "Cronografo", status: "Nuova", date: "2024-07-29" },
];

type Request = typeof mockRequests[0];

export default function AdminRichiestePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredRequests = mockRequests.filter((request) => {
    const term = searchTerm.toLowerCase();
    return (
      request.id.toLowerCase().includes(term) ||
      request.clientName.toLowerCase().includes(term) ||
      request.watchType.toLowerCase().includes(term) ||
      request.status.toLowerCase().includes(term)
    );
  });


  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gestione Richieste Clienti</h1>
          <p className="text-muted-foreground mt-1">Visualizza e gestisci tutte le richieste personalizzate.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" />
          Aggiungi Nuova Richiesta
        </Button>
      </div>

      <Card className="bg-card shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="font-headline text-xl text-primary">Elenco Richieste</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cerca per ID, cliente, tipo, stato..." 
                className="pl-9 w-full sm:w-[300px] bg-input" 
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
                <TableHead>ID Richiesta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo Orologio</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.clientName}</TableCell>
                  <TableCell>{request.watchType}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={request.status === 'Nuova' ? 'default' : request.status === 'In Lavorazione' ? 'secondary' : 'outline'}
                      className={
                        request.status === 'Nuova' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30' :
                        request.status === 'In Lavorazione' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30' :
                        'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
                      }
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(request.date).toLocaleDateString('it-IT')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">Dettagli</Button>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm ? `Nessuna richiesta trovata per "${searchTerm}".` : "Nessuna richiesta presente."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        La funzione di ricerca è implementata. La gestione dettagliata (aggiunta, modifica, assegnazione, ecc.) non è ancora implementata.
      </p>
    </div>
  );
}

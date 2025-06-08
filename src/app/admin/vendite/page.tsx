
// src/app/admin/vendite/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function AdminVenditePage() {
  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="font-headline text-4xl font-bold text-primary">Gestione Proposte di Vendita</h1>
        <p className="text-muted-foreground mt-1">Visualizza e gestisci le proposte di vendita degli utenti.</p>
      </div>
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">Elenco Proposte</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-accent animate-pulse" />
            <p className="mb-2">La gestione delle proposte di vendita non è ancora implementata.</p>
            <p className="text-sm">Questa sezione permetterà di visualizzare le proposte, fare valutazioni e gestire le transazioni.</p>
        </CardContent>
      </Card>
    </div>
  );
}

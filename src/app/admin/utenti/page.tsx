
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users2 } from "lucide-react";

export default function AdminUtentiPage() {
  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="font-headline text-4xl font-bold text-primary">Gestione Utenti</h1>
        <p className="text-muted-foreground mt-1">Visualizza e gestisci gli utenti registrati.</p>
      </div>
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">Elenco Utenti</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <Users2 className="h-16 w-16 mx-auto mb-4 text-accent" />
            <p className="mb-2">La gestione utenti non è ancora implementata.</p>
            <p className="text-sm">Questa sezione permetterà di visualizzare, modificare ruoli e stati degli utenti.</p>
        </CardContent>
      </Card>
    </div>
  );
}

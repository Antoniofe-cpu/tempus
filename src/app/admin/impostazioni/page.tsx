
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminImpostazioniPage() {
  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="font-headline text-4xl font-bold text-primary">Impostazioni Applicazione</h1>
        <p className="text-muted-foreground mt-1">Configura le impostazioni generali di Tempus Concierge.</p>
      </div>
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">Opzioni di Configurazione</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <Settings className="h-16 w-16 mx-auto mb-4 text-accent animate-spin-slow" />
            <p className="mb-2">La sezione impostazioni non è ancora implementata.</p>
            <p className="text-sm">Qui potrai configurare tassi di servizio, integrazioni email, API keys, ecc.</p>
        </CardContent>
      </Card>
    </div>
  );
}

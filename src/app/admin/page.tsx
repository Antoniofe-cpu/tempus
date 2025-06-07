
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, ListChecks, PackagePlus } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Richieste Totali", value: "125", icon: <ListChecks className="h-6 w-6 text-accent" />, description: "+15% dal mese scorso" },
    { title: "Orologi Gestiti", value: "78", icon: <PackagePlus className="h-6 w-6 text-accent" />, description: "+5 nuovi questa settimana" },
    { title: "Utenti Registrati", value: "42", icon: <Users className="h-6 w-6 text-accent" />, description: "+3 nuovi utenti" },
  ];

  return (
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-4xl font-bold text-primary">Dashboard Amministrazione</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card shadow-lg hover:shadow-primary/10 transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Panoramica Attività Recenti</CardTitle>
            <CardDescription className="text-muted-foreground">Ultime richieste e aggiornamenti.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent activity feed */}
            <ul className="space-y-3">
              <li className="text-sm text-foreground/80 p-3 bg-muted/30 rounded-md">Nuova richiesta da G. Verdi per un cronografo vintage.</li>
              <li className="text-sm text-foreground/80 p-3 bg-muted/30 rounded-md">Orologio "Rolex Daytona" marcato come venduto.</li>
              <li className="text-sm text-foreground/80 p-3 bg-muted/30 rounded-md">Aggiornamento stato richiesta #122: In trattativa.</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Statistiche Vendite (Placeholder)</CardTitle>
             <CardDescription className="text-muted-foreground">Andamento delle vendite mediate.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <BarChart className="h-16 w-16 mx-auto mb-2 text-accent" />
              <p>Grafico statistiche vendite non ancora implementato.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

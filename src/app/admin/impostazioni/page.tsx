
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AppSettings } from '@/lib/types';
import { getAppSettings, updateAppSettings } from '@/services/appSettingsService';

const AppSettingsSchema = z.object({
  appName: z.string().min(3, { message: "Il nome dell'applicazione deve avere almeno 3 caratteri." }),
  contactEmail: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  defaultCurrency: z.string().length(3, { message: "Il codice valuta deve essere di 3 caratteri (es. EUR)." }).toUpperCase(),
});

type AppSettingsFormData = z.infer<typeof AppSettingsSchema>;

export default function AdminImpostazioniPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppSettingsFormData>({
    resolver: zodResolver(AppSettingsSchema),
  });

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const settings = await getAppSettings();
        reset(settings); // Popola il form con le impostazioni caricate
      } catch (error) {
        toast({
          title: "Errore Caricamento Impostazioni",
          description: (error as Error).message || "Impossibile caricare le impostazioni.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [reset, toast]);

  const onSubmit = async (data: AppSettingsFormData) => {
    setIsSaving(true);
    try {
      await updateAppSettings(data);
      toast({
        title: "Impostazioni Salvate",
        description: "Le impostazioni dell'applicazione sono state aggiornate con successo.",
      });
    } catch (error) {
      toast({
        title: "Errore Salvataggio",
        description: (error as Error).message || "Impossibile salvare le impostazioni.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="font-headline text-4xl font-bold text-primary">Impostazioni Applicazione</h1>
        <p className="text-muted-foreground mt-1">Configura le impostazioni generali di Tempus Concierge.</p>
      </div>
      <Card className="bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">Configurazione Globale</CardTitle>
          <CardDescription className="text-muted-foreground">
            Modifica i parametri di base dell'applicazione. Queste impostazioni sono salvate in Firestore.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="appName" className="text-foreground/80">Nome Applicazione</Label>
              <Input 
                id="appName" 
                {...register("appName")} 
                className="mt-1 bg-input border-border focus:border-accent focus:ring-accent"
                disabled={isSaving}
              />
              {errors.appName && <p className="text-sm text-destructive mt-1">{errors.appName.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="contactEmail" className="text-foreground/80">Email di Contatto Principale</Label>
              <Input 
                id="contactEmail" 
                type="email" 
                {...register("contactEmail")} 
                className="mt-1 bg-input border-border focus:border-accent focus:ring-accent"
                disabled={isSaving}
              />
              {errors.contactEmail && <p className="text-sm text-destructive mt-1">{errors.contactEmail.message}</p>}
            </div>

            <div>
              <Label htmlFor="defaultCurrency" className="text-foreground/80">Valuta Predefinita (Codice ISO)</Label>
              <Input 
                id="defaultCurrency" 
                {...register("defaultCurrency")} 
                placeholder="EUR"
                className="mt-1 bg-input border-border focus:border-accent focus:ring-accent"
                disabled={isSaving}
              />
              {errors.defaultCurrency && <p className="text-sm text-destructive mt-1">{errors.defaultCurrency.message}</p>}
            </div>
            
            {/* Qui potrebbero essere aggiunti altri campi di impostazione */}

          </CardContent>
          <CardFooter className="border-t border-border/40 pt-6">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving || isLoading}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Salvataggio..." : "Salva Impostazioni"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

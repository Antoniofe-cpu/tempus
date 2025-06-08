
'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ImageUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AppSettings } from '@/lib/types';
import { getAppSettings, updateAppSettings, uploadAppSettingsIcon } from '@/services/appSettingsService';
import Image from 'next/image'; // Per l'anteprima

const AppSettingsSchema = z.object({
  appName: z.string().min(3, { message: "Il nome dell'applicazione deve avere almeno 3 caratteri." }),
  contactEmail: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  defaultCurrency: z.string().length(3, { message: "Il codice valuta deve essere di 3 caratteri (es. EUR)." }).toUpperCase(),
  mainServicesIconUrl: z.string().url({message: "L'URL dell'icona non è valido."}).optional().or(z.literal('')),
});

type AppSettingsFormData = z.infer<typeof AppSettingsSchema>;

export default function AdminImpostazioniPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mainServicesIconFile, setMainServicesIconFile] = useState<File | null>(null);
  const [currentIconUrl, setCurrentIconUrl] = useState<string | undefined>('');


  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AppSettingsFormData>({
    resolver: zodResolver(AppSettingsSchema),
    defaultValues: {
        appName: '',
        contactEmail: '',
        defaultCurrency: 'EUR',
        mainServicesIconUrl: '',
    }
  });

  const watchedIconUrl = watch('mainServicesIconUrl');

  useEffect(() => {
    setCurrentIconUrl(watchedIconUrl);
  }, [watchedIconUrl]);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const settings = await getAppSettings();
        reset({
            appName: settings.appName,
            contactEmail: settings.contactEmail,
            defaultCurrency: settings.defaultCurrency,
            mainServicesIconUrl: settings.mainServicesIconUrl || '',
        });
        setCurrentIconUrl(settings.mainServicesIconUrl || '');
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

  const handleIconFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMainServicesIconFile(file);
      // Preview locale se si volesse, ma per ora gestiamo solo il file
    } else {
      setMainServicesIconFile(null);
    }
  };

  const onSubmit = async (data: AppSettingsFormData) => {
    setIsSaving(true);
    let iconUrlToSave = data.mainServicesIconUrl;

    try {
      if (mainServicesIconFile) {
        toast({ title: "Caricamento Icona", description: "L'icona è in fase di caricamento..."});
        iconUrlToSave = await uploadAppSettingsIcon(mainServicesIconFile, 'main-services-icon');
        setValue('mainServicesIconUrl', iconUrlToSave); // Aggiorna il valore nel form per il prossimo submit
        setCurrentIconUrl(iconUrlToSave); // Aggiorna l'URL per l'anteprima
        setMainServicesIconFile(null); // Resetta il file dopo l'upload
         toast({ title: "Icona Caricata", description: "Icona caricata con successo."});
      }
      
      const settingsToUpdate: Partial<Omit<AppSettings, 'id' | 'updatedAt'>> = {
        appName: data.appName,
        contactEmail: data.contactEmail,
        defaultCurrency: data.defaultCurrency,
        mainServicesIconUrl: iconUrlToSave || '', // Assicura che sia stringa vuota se non c'è URL
      };

      await updateAppSettings(settingsToUpdate);
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

            <div className="border-t border-border/40 pt-6 space-y-2">
                <Label htmlFor="mainServicesIconFile" className="text-foreground/80 block">Icona Principale Servizi</Label>
                <p className="text-xs text-muted-foreground mb-2">Carica un file immagine (es. PNG, JPG, SVG) da usare come icona generica per i servizi.</p>
                <div className="flex items-center gap-3">
                    <Input
                        id="mainServicesIconFile"
                        type="file"
                        accept="image/*,.svg"
                        onChange={handleIconFileChange}
                        className="bg-input border-border focus:border-accent focus:ring-accent flex-grow"
                        disabled={isSaving}
                    />
                    <ImageUp className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                </div>
                {mainServicesIconFile && (
                    <p className="text-xs text-muted-foreground mt-1">Selezionato: {mainServicesIconFile.name}</p>
                )}
                {errors.mainServicesIconUrl && <p className="text-sm text-destructive mt-1">{errors.mainServicesIconUrl.message}</p>}
                
                {currentIconUrl && (
                    <div className="mt-3 p-3 border rounded-md bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-2">Anteprima Icona Attuale:</p>
                        <Image
                            src={currentIconUrl}
                            alt="Icona Principale Servizi"
                            width={64}
                            height={64}
                            className="rounded-md border border-border object-contain"
                            onError={(e) => { 
                                e.currentTarget.src = 'https://placehold.co/64x64.png/transparent/transparent?text=Errore'; 
                                e.currentTarget.srcset = '';
                            }}
                        />
                    </div>
                )}
                 {!currentIconUrl && !mainServicesIconFile && (
                    <div className="mt-3 p-3 border border-dashed rounded-md bg-muted/30 text-center">
                        <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-1"/>
                        <p className="text-xs text-muted-foreground">Nessuna icona attualmente impostata o selezionata.</p>
                    </div>
                )}
                <Input type="hidden" {...register("mainServicesIconUrl")} />
            </div>
            

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

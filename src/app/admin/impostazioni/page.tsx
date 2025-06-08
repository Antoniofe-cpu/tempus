
'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ImageUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AppSettings } from '@/lib/types';
import { getAppSettings, updateAppSettings } from '@/services/appSettingsService';
import Image from 'next/image';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AppSettingsSchema = z.object({
  appName: z.string().min(3, { message: "Il nome dell'applicazione deve avere almeno 3 caratteri." }),
  contactEmail: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  defaultCurrency: z.string().length(3, { message: "Il codice valuta deve essere di 3 caratteri (es. EUR)." }).toUpperCase(),
  iconUrlCompra: z.string().url({message: "L'URL dell'icona Compra non è valido."}).optional().or(z.literal('')),
  iconUrlVendi: z.string().url({message: "L'URL dell'icona Vendi non è valido."}).optional().or(z.literal('')),
  iconUrlCerca: z.string().url({message: "L'URL dell'icona Cerca non è valido."}).optional().or(z.literal('')),
  iconUrlRipara: z.string().url({message: "L'URL dell'icona Ripara non è valido."}).optional().or(z.literal('')),
});

type AppSettingsFormData = z.infer<typeof AppSettingsSchema>;

interface ServiceIconField {
  key: keyof Pick<AppSettingsFormData, 'iconUrlCompra' | 'iconUrlVendi' | 'iconUrlCerca' | 'iconUrlRipara'>;
  label: string;
  fileState: File | null;
  setFileState: React.Dispatch<React.SetStateAction<File | null>>;
  currentUrlState: string | undefined;
  setCurrentUrlState: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export default function AdminImpostazioniPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [iconFileCompra, setIconFileCompra] = useState<File | null>(null);
  const [currentIconUrlCompra, setCurrentIconUrlCompra] = useState<string | undefined>('');
  const [iconFileVendi, setIconFileVendi] = useState<File | null>(null);
  const [currentIconUrlVendi, setCurrentIconUrlVendi] = useState<string | undefined>('');
  const [iconFileCerca, setIconFileCerca] = useState<File | null>(null);
  const [currentIconUrlCerca, setCurrentIconUrlCerca] = useState<string | undefined>('');
  const [iconFileRipara, setIconFileRipara] = useState<File | null>(null);
  const [currentIconUrlRipara, setCurrentIconUrlRipara] = useState<string | undefined>('');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AppSettingsFormData>({
    resolver: zodResolver(AppSettingsSchema),
    defaultValues: {
        appName: '',
        contactEmail: '',
        defaultCurrency: 'EUR',
        iconUrlCompra: '',
        iconUrlVendi: '',
        iconUrlCerca: '',
        iconUrlRipara: '',
    }
  });

  const watchedIconUrlCompra = watch('iconUrlCompra');
  const watchedIconUrlVendi = watch('iconUrlVendi');
  const watchedIconUrlCerca = watch('iconUrlCerca');
  const watchedIconUrlRipara = watch('iconUrlRipara');

  useEffect(() => { setCurrentIconUrlCompra(watchedIconUrlCompra); }, [watchedIconUrlCompra]);
  useEffect(() => { setCurrentIconUrlVendi(watchedIconUrlVendi); }, [watchedIconUrlVendi]);
  useEffect(() => { setCurrentIconUrlCerca(watchedIconUrlCerca); }, [watchedIconUrlCerca]);
  useEffect(() => { setCurrentIconUrlRipara(watchedIconUrlRipara); }, [watchedIconUrlRipara]);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const settings = await getAppSettings();
        reset({
            appName: settings.appName,
            contactEmail: settings.contactEmail,
            defaultCurrency: settings.defaultCurrency,
            iconUrlCompra: settings.iconUrlCompra || '',
            iconUrlVendi: settings.iconUrlVendi || '',
            iconUrlCerca: settings.iconUrlCerca || '',
            iconUrlRipara: settings.iconUrlRipara || '',
        });
        setCurrentIconUrlCompra(settings.iconUrlCompra || '');
        setCurrentIconUrlVendi(settings.iconUrlVendi || '');
        setCurrentIconUrlCerca(settings.iconUrlCerca || '');
        setCurrentIconUrlRipara(settings.iconUrlRipara || '');
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

  const handleIconFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFileState: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0];
    setFileState(file || null);
  };

  const uploadIconAndGetURL = async (file: File, iconName: string): Promise<string> => {
    try {
      const fileName = `app-settings-icons/${iconName}-${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error: any) {
      console.error(`Error uploading ${iconName} icon (client-side):`, error);
      throw new Error(`Impossibile caricare l'icona ${iconName}: ${error.message || 'Errore sconosciuto durante upload.'}`);
    }
  };

  const iconFields: ServiceIconField[] = [
    { key: 'iconUrlCompra', label: 'Icona Card "Compra"', fileState: iconFileCompra, setFileState: setIconFileCompra, currentUrlState: currentIconUrlCompra, setCurrentUrlState: setCurrentIconUrlCompra },
    { key: 'iconUrlVendi', label: 'Icona Card "Vendi"', fileState: iconFileVendi, setFileState: setIconFileVendi, currentUrlState: currentIconUrlVendi, setCurrentUrlState: setCurrentIconUrlVendi },
    { key: 'iconUrlCerca', label: 'Icona Card "Cerca"', fileState: iconFileCerca, setFileState: setIconFileCerca, currentUrlState: currentIconUrlCerca, setCurrentUrlState: setCurrentIconUrlCerca },
    { key: 'iconUrlRipara', label: 'Icona Card "Ripara"', fileState: iconFileRipara, setFileState: setIconFileRipara, currentUrlState: currentIconUrlRipara, setCurrentUrlState: setCurrentIconUrlRipara },
  ];

  const onSubmit = async (data: AppSettingsFormData) => {
    setIsSaving(true);
    const updatedIconUrls: Partial<Pick<AppSettingsFormData, 'iconUrlCompra' | 'iconUrlVendi' | 'iconUrlCerca' | 'iconUrlRipara'>> = {};

    try {
      for (const field of iconFields) {
        let urlToSave = data[field.key];
        if (field.fileState) {
          toast({ title: `Caricamento Icona ${field.label}`, description: "L'icona è in fase di caricamento..."});
          urlToSave = await uploadIconAndGetURL(field.fileState, field.key);
          setValue(field.key, urlToSave); 
          field.setCurrentUrlState(urlToSave); 
          field.setFileState(null); 
          toast({ title: `Icona ${field.label} Caricata`, description: "Icona caricata con successo."});
        }
        updatedIconUrls[field.key] = urlToSave || '';
      }
      
      const settingsToUpdate: Partial<Omit<AppSettings, 'id' | 'updatedAt'>> = {
        appName: data.appName,
        contactEmail: data.contactEmail,
        defaultCurrency: data.defaultCurrency,
        ...updatedIconUrls,
      };

      await updateAppSettings(settingsToUpdate);
      toast({
        title: "Impostazioni Salvate",
        description: "Le impostazioni dell'applicazione sono state aggiornate con successo.",
      });
    } catch (error) {
      console.error("Errore durante il salvataggio delle impostazioni (client-side, onSubmit):", error);
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
            Modifica i parametri di base dell'applicazione e le icone principali per le card servizio.
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
            
            <div className="border-t border-border/40 pt-6 space-y-4">
                 <h3 className="text-lg font-semibold text-primary">Icone Card Servizio Principali</h3>
                 <p className="text-xs text-muted-foreground">
                    Queste icone possono essere usate come fallback o per rappresentare le sezioni servizio in vari punti dell'app.
                    Sono diverse dalle icone specifiche che puoi caricare nella sezione "Gestione Servizi", ma possono sovrascriverle se quelle non sono impostate.
                 </p>
            </div>

            {iconFields.map((field) => (
              <div key={field.key} className="border-t border-border/40 pt-6 space-y-2">
                  <Label htmlFor={`${field.key}-file`} className="text-foreground/80 block">{field.label}</Label>
                  <p className="text-xs text-muted-foreground mb-2">Carica un file immagine (es. PNG, JPG, SVG).</p>
                  <div className="flex items-center gap-3">
                      <Input
                          id={`${field.key}-file`}
                          type="file"
                          accept="image/*,.svg"
                          onChange={(e) => handleIconFileChange(e, field.setFileState)}
                          className="bg-input border-border focus:border-accent focus:ring-accent flex-grow"
                          disabled={isSaving}
                      />
                      <ImageUp className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                  </div>
                  {field.fileState && (
                      <p className="text-xs text-muted-foreground mt-1">Selezionato: {field.fileState.name}</p>
                  )}
                  {errors[field.key] && <p className="text-sm text-destructive mt-1">{errors[field.key]?.message}</p>}
                  
                  {field.currentUrlState && (
                      <div className="mt-3 p-3 border rounded-md bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-2">Anteprima Icona Attuale:</p>
                          <Image
                              src={field.currentUrlState}
                              alt={field.label}
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
                  {!field.currentUrlState && !field.fileState && (
                      <div className="mt-3 p-3 border border-dashed rounded-md bg-muted/30 text-center">
                          <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-1"/>
                          <p className="text-xs text-muted-foreground">Nessuna icona per "{field.label}" attualmente impostata o selezionata.</p>
                      </div>
                  )}
                  <Input type="hidden" {...register(field.key)} />
              </div>
            ))}
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

    

// src/app/admin/servizi/page.tsx
'use client';

import { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImageUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getServiceCards, updateServiceCard } from '@/services/serviceCardService'; 

interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  iconUrl?: string; 
  link: string;
  iconFile?: FileList | null; // Per gestire il file selezionato
}

export default function AdminServiziPage() {
  const [services, setServices] = useState<ServiceCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getServiceCards();
      setServices(data.map(s => ({ ...s, iconFile: null }))); 
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({ title: "Errore", description: "Impossibile caricare i dati dei servizi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleInputChange = (id: string, field: keyof Omit<ServiceCardData, 'iconFile'>, value: string) => {
    setServices(services.map(service =>
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  const handleFileChange = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setServices(services.map(service =>
      service.id === id ? { ...service, iconFile: files } : service
    ));
  };
  
  const uploadServiceIcon = async (file: File | undefined): Promise<string | undefined> => {
    if (!file) return undefined;
    // Placeholder: In una implementazione reale, qui caricheresti il file su Firebase Storage
    // e restituiresti l'URL di download.
    console.log("Placeholder: Uploading file (non implementato):", file.name);
    toast({
      title: "Info Sviluppo",
      description: `L'upload del file "${file.name}" non è ancora implementato. Verrà usato l'URL testuale se fornito, o un placeholder se l'URL testuale è vuoto.`,
      variant: "default"
    });
    // Per ora, restituiamo un URL placeholder se l'upload non è implementato
    // o l'URL originale se non vogliamo sovrascriverlo.
    // In questo caso, lasciamo che iconUrl testuale abbia la precedenza.
    return undefined; // Indica che l'upload non ha prodotto un nuovo URL da usare.
  };


  const handleSave = async (serviceToSave: ServiceCardData) => {
    setSavingStates(prev => ({ ...prev, [serviceToSave.id]: true }));
    let finalIconUrl = serviceToSave.iconUrl;

    if (serviceToSave.iconFile && serviceToSave.iconFile.length > 0) {
      const uploadedUrl = await uploadServiceIcon(serviceToSave.iconFile[0]);
      if (uploadedUrl) {
        finalIconUrl = uploadedUrl; // Usa l'URL dell'immagine caricata se l'upload ha successo
      } else {
        // Se l'upload non è implementato o fallisce, ma un file è stato selezionato,
        // si potrebbe voler dare un feedback o usare un placeholder.
        // Attualmente, se uploadedUrl è undefined, si mantiene finalIconUrl (l'URL testuale).
        // Se l'URL testuale è vuoto e un file è stato selezionato ma l'upload non ha prodotto un URL,
        // finalIconUrl potrebbe rimanere vuoto, e l'icona fallback verrebbe usata nel componente ServiceCard.
         if (!finalIconUrl) { // Solo se l'URL testuale era vuoto e l'upload non ha prodotto un URL
           finalIconUrl = `https://placehold.co/64x64.png?text=${serviceToSave.title.substring(0,3)}`; // Placeholder generico
         }
      }
    }

    const serviceCardToUpdate = {
      title: serviceToSave.title,
      description: serviceToSave.description,
      iconUrl: finalIconUrl || '', // Assicura che sia una stringa, anche vuota
      link: serviceToSave.link,
    };

    try {
      await updateServiceCard(serviceToSave.id, serviceCardToUpdate);
      toast({ title: "Successo", description: `Servizio "${serviceToSave.title}" salvato con successo.` });
      // Resetta il campo file dopo il salvataggio
      setServices(prevServices => prevServices.map(s => 
        s.id === serviceToSave.id ? { ...s, iconFile: null } : s
      ));
    } catch (error) {
      console.error("Error saving service:", error);
      toast({ title: "Errore", description: `Impossibile salvare il servizio "${serviceToSave.title}".`, variant: "destructive" });
    } finally {
      setSavingStates(prev => ({ ...prev, [serviceToSave.id]: false }));
    }
  };

  return (
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Gestione Servizi</h1>
          <p className="text-muted-foreground mt-1">Modifica i contenuti delle card servizio sulla homepage.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {services.map(service => (
            <Card key={service.id} className="bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`description-${service.id}`} className="text-foreground/80 block mb-1.5">Descrizione</Label>
                  <Textarea
                    id={`description-${service.id}`}
                    value={service.description}
                    onChange={(e) => handleInputChange(service.id, 'description', e.target.value)}
                    className="bg-input border-border focus:border-accent focus:ring-accent min-h-[80px]"
                    disabled={savingStates[service.id]}
                  />
                </div>
                <div>
                  <Label htmlFor={`iconUrl-${service.id}`} className="text-foreground/80 block mb-1.5">URL Icona/Immagine (Opzionale)</Label>
                  <Input
                    id={`iconUrl-${service.id}`}
                    value={service.iconUrl || ''}
                    onChange={(e) => handleInputChange(service.id, 'iconUrl', e.target.value)}
                    className="bg-input border-border focus:border-accent focus:ring-accent"
                    placeholder="https://example.com/icon.png"
                    disabled={savingStates[service.id]}
                  />
                </div>
                <div>
                  <Label htmlFor={`iconFile-${service.id}`} className="text-foreground/80 block mb-1.5">Carica Icona (Alternativa all'URL)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`iconFile-${service.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(service.id, e)}
                      className="bg-input border-border focus:border-accent focus:ring-accent flex-grow"
                      disabled={savingStates[service.id]}
                    />
                    <ImageUp className="h-5 w-5 text-muted-foreground"/>
                  </div>
                  {service.iconFile && service.iconFile.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Selezionato: {service.iconFile[0].name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Nota: L'upload effettivo non è implementato. Se fornisci un URL, avrà la precedenza.</p>
                </div>
                <div>
                  <Label htmlFor={`link-${service.id}`} className="text-foreground/80 block mb-1.5">Link Pagina</Label>
                  <Input
                    id={`link-${service.id}`}
                    value={service.link}
                    onChange={(e) => handleInputChange(service.id, 'link', e.target.value)}
                    className="bg-input border-border focus:border-accent focus:ring-accent"
                    placeholder="/shop"
                    disabled={savingStates[service.id]}
                  />
                </div>
                <div className="pt-4 border-t border-border/40">
                 <Button onClick={() => handleSave(service)} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full" disabled={savingStates[service.id] || isLoading}>
                    {savingStates[service.id] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {savingStates[service.id] ? 'Salvataggio...' : 'Salva Modifiche'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


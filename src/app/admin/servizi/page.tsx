// src/app/admin/servizi/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getServiceCards, updateServiceCard } from '@/services/serviceCardService'; // Import Firestore service functions

// Define the type for a service card (ensure this matches the service file)
interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  iconUrl?: string; // Optional image/icon URL
  link: string;
}

// Mock data for initial services (replace with Firestore logic later)
export default function AdminServiziPage() {
  const [services, setServices] = useState<ServiceCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isSaving, setIsSaving] = useState(false); // State for saving process
  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      // Replace with Firestore fetch logic
      const data = await getServiceCards();
      // Sort services if needed, e.g., alphabetically by title or by a predefined order
      setServices(data); // Assuming getServiceCards returns ServiceCardData[]
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({ title: "Errore", description: "Impossibile caricare i dati dei servizi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
    // Add dependencies if any state variables are used inside useCallback that could change
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Handle input changes for a specific service
  const handleInputChange = (id: string, field: keyof ServiceCardData, value: string) => {
    setServices(services.map(service =>
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  // TODO: Implement saving services to Firestore
  const handleSave = async (serviceToSave: ServiceCardData) => { // Renamed from service to serviceToSave for clarity
    setIsSaving(true); // Start saving state
    try {
      console.log("Saving service:", serviceToSave);
      await updateServiceCard(serviceToSave.id, serviceToSave); // Use the updateServiceCard function
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save delay
      toast({ title: "Successo", description: `Servizio "${serviceToSave.title}" salvato con successo.` });
    } catch (error) {
      console.error("Error saving service:", error);
      toast({ title: "Errore", description: `Impossibile salvare il servizio "${serviceToSave.title}".`, variant: "destructive" });
    } finally { // This should be setIsSaving, not setIsLoading
      setIsLoading(false);
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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                  />
                </div>
                <div>
                  <Label htmlFor={`link-${service.id}`} className="text-foreground/80 block mb-1.5">Link Pagina</Label>
                  <Input
                    id={`link-${service.id}`}
                    value={service.link}
                    onChange={(e) => handleInputChange(service.id, 'link', e.target.value)}
                    className="bg-input border-border focus:border-accent focus:ring-accent"
                    placeholder="/shop"
                  />
                </div>
                <div className="pt-4 border-t border-border/40">
 <Button onClick={() => handleSave(service)} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
 Salva Modifiche
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

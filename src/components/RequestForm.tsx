'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { submitPersonalizedRequest, FormState } from '@/lib/actions';
import AiSuggestions from './AiSuggestions';
import type { WatchType } from '@/lib/types';
import React, { useEffect, useState, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircleIcon, Sparkles, SendIcon, Loader2 } from "lucide-react";

const PersonalizedRequestSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  watchType: z.string().min(1, { message: "Seleziona un tipo di orologio." }),
  desiredBrand: z.string().optional(),
  desiredModel: z.string().optional(),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce.number().min(0).optional(),
  aiCriteria: z.string().max(500, {message: "La descrizione per AI non può superare i 500 caratteri."}).optional(),
  additionalNotes: z.string().max(1000, {message: "Le note aggiuntive non possono superare i 1000 caratteri."}).optional(),
}).refine(data => !data.budgetMin || !data.budgetMax || data.budgetMax >= data.budgetMin, {
  message: "Il budget massimo deve essere maggiore o uguale al budget minimo.",
  path: ["budgetMax"],
});

type PersonalizedRequestFormData = z.infer<typeof PersonalizedRequestSchema>;

const watchTypes: WatchType[] = ['Dress', 'Sportivo', 'Cronografo', 'Subacqueo', 'Vintage', 'Altro'];
const budgetPresets = [
  { label: "€0 - €5,000", min: 0, max: 5000 },
  { label: "€5,000 - €15,000", min: 5000, max: 15000 },
  { label: "€15,000 - €50,000", min: 15000, max: 50000 },
  { label: "€50,000+", min: 50000, max: 200000 }, // Max is for slider practical limit
];


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
          Invio in corso...
        </>
      ) : (
        <>
          Invia Richiesta <SendIcon className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}


export default function RequestForm() {
  const initialState: FormState = { message: '', success: false };
  const [state, formAction] = useFormState(submitPersonalizedRequest, initialState);
  
  const { register, control, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<PersonalizedRequestFormData>({
    resolver: zodResolver(PersonalizedRequestSchema),
    defaultValues: {
      budgetMin: budgetPresets[0].min,
      budgetMax: budgetPresets[0].max,
    }
  });

  const [budgetRange, setBudgetRange] = useState<[number, number]>([budgetPresets[0].min, budgetPresets[0].max]);
  const aiCriteriaValue = watch("aiCriteria");

  useEffect(() => {
    if (state.success) {
      reset(); 
      setBudgetRange([budgetPresets[0].min, budgetPresets[0].max]);
    }
    if (state.fields && !state.success) {
       Object.entries(state.fields).forEach(([key, value]) => {
        setValue(key as keyof PersonalizedRequestFormData, value);
      });
    }
  }, [state, reset, setValue]);

  const handleBudgetChange = (value: [number, number]) => {
    setBudgetRange(value);
    setValue("budgetMin", value[0], { shouldValidate: true });
    setValue("budgetMax", value[1], { shouldValidate: true });
  };

  const handlePresetChange = (value: string) => {
    const preset = budgetPresets.find(p => `${p.min}-${p.max}` === value);
    if (preset) {
      handleBudgetChange([preset.min, preset.max]);
    }
  };

  const handleAiSuggestionClick = (suggestion: string) => {
    const currentNotes = watch("additionalNotes") || "";
    const newNotes = `${currentNotes}\n- Suggerimento AI: ${suggestion}`.trim();
    setValue("additionalNotes", newNotes, { shouldValidate: true });
  };
  
  const handleTriggerAiSuggestions = useCallback(() => {
    const criteria = watch("aiCriteria");
    if (typeof (window as any).triggerAiSuggestionsGlobal === 'function') {
      (window as any).triggerAiSuggestionsGlobal(criteria || '');
    } else {
      console.warn("triggerAiSuggestionsGlobal function not found on window object.");
    }
  }, [watch]);


  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl bg-card border border-border/60">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-4xl text-primary">Richiesta Personalizzata</CardTitle>
        <CardDescription className="text-muted-foreground text-lg">
          Descrivici l'orologio dei tuoi sogni. Lo troveremo per te.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-8">
          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
              {state.issues && (
                <ul className="list-disc list-inside mt-2 text-sm">
                  {state.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              )}
            </Alert>
          )}
          {state.message && state.success && (
             <Alert variant="default" className="bg-green-500/10 border-green-500 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-600 dark:text-green-500">Successo!</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-foreground/80">Nome Completo</Label>
              <Input id="name" {...register("name")} placeholder="Mario Rossi" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="text-foreground/80">Indirizzo Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="mario.rossi@esempio.com" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="watchType" className="text-foreground/80">Tipo di Orologio</Label>
            <Controller
              name="watchType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""} >
                  <SelectTrigger id="watchType" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent">
                    <SelectValue placeholder="Seleziona un tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {watchTypes.map(type => (
                      <SelectItem key={type} value={type} className="hover:bg-accent/20 focus:bg-accent/20">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.watchType && <p className="text-sm text-destructive mt-1">{errors.watchType.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="desiredBrand" className="text-foreground/80">Marca Desiderata (Opzionale)</Label>
              <Input id="desiredBrand" {...register("desiredBrand")} placeholder="Es. Rolex, Omega" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
            </div>
            <div>
              <Label htmlFor="desiredModel" className="text-foreground/80">Modello Desiderato (Opzionale)</Label>
              <Input id="desiredModel" {...register("desiredModel")} placeholder="Es. Submariner, Speedmaster" className="mt-1 bg-input border-border focus:border-accent focus:ring-accent" />
            </div>
          </div>
          
          <div>
            <Label className="text-foreground/80">Fascia di Prezzo (Opzionale)</Label>
            <div className="mt-2 space-y-3">
              <Controller
                name="budgetMin" // This makes sure RHF tracks the field
                control={control}
                render={({ field }) => (
                  <Select onValueChange={handlePresetChange} defaultValue={`${budgetPresets[0].min}-${budgetPresets[0].max}`}>
                    <SelectTrigger className="w-full md:w-1/2 bg-input border-border focus:border-accent focus:ring-accent">
                      <SelectValue placeholder="Seleziona fascia di prezzo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {budgetPresets.map(preset => (
                        <SelectItem key={preset.label} value={`${preset.min}-${preset.max}`} className="hover:bg-accent/20 focus:bg-accent/20">{preset.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Slider
                value={budgetRange}
                onValueChange={handleBudgetChange}
                min={0}
                max={200000} 
                step={500}
                className="[&>span>span]:bg-accent [&>span]:bg-primary/30"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>€{budgetRange[0].toLocaleString('it-IT')}</span>
                <span>€{budgetRange[1].toLocaleString('it-IT')}</span>
              </div>
              {/* Hidden inputs are not strictly necessary if using Controller for Slider values, but keep for RHF direct registration */}
              <input type="hidden" {...register("budgetMin")} value={budgetRange[0]} />
              <input type="hidden" {...register("budgetMax")} value={budgetRange[1]} />
              {errors.budgetMax && <p className="text-sm text-destructive mt-1">{errors.budgetMax.message}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="aiCriteria" className="text-foreground/80">Descrivi la tua richiesta (per suggerimenti AI)</Label>
            <Textarea
              id="aiCriteria"
              {...register("aiCriteria")}
              placeholder="Es. Cerco un orologio sportivo elegante, resistente all'acqua, con bracciale in acciaio, quadrante blu, sotto i 10.000€"
              className="mt-1 min-h-[100px] bg-input border-border focus:border-accent focus:ring-accent"
            />
             {errors.aiCriteria && <p className="text-sm text-destructive mt-1">{errors.aiCriteria.message}</p>}
            <Button type="button" variant="outline" onClick={handleTriggerAiSuggestions} className="mt-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Sparkles className="mr-2 h-4 w-4" /> Ottieni Suggerimenti AI
            </Button>
          </div>

          <AiSuggestions onSuggestionClick={handleAiSuggestionClick} context="form" triggerFetch={handleTriggerAiSuggestions} />

          <div>
            <Label htmlFor="additionalNotes" className="text-foreground/80">Note Aggiuntive (Opzionale)</Label>
            <Textarea
              id="additionalNotes"
              {...register("additionalNotes")}
              placeholder="Qualsiasi altra preferenza o dettaglio utile..."
              className="mt-1 min-h-[120px] bg-input border-border focus:border-accent focus:ring-accent"
            />
            {errors.additionalNotes && <p className="text-sm text-destructive mt-1">{errors.additionalNotes.message}</p>}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Cliccando "Invia Richiesta", accetti i nostri Termini di Servizio e la Politica sulla Privacy. Un nostro concierge ti contatterà entro 24 ore. Il servizio di ricerca ha un costo che ti verrà comunicato.
          </p>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

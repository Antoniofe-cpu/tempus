export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/95 py-8">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Tempus Concierge. Tutti i diritti riservati.</p>
        <p className="mt-1">Servizio esclusivo per amanti e collezionisti di orologi.</p>
      </div>
    </footer>
  );
}

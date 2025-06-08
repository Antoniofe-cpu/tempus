
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-watches.ts';
import '@/ai/flows/generate-hero-image-flow.ts'; // Aggiunto il nuovo flow
import '@/ai/flows/fetch-watch-news-flow.ts'; // Aggiunto il flow per le notizie


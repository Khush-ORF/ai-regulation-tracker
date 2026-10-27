// Content collections over data/. The record schemas live in src/schema.mjs, shared with the data
// pipeline, so the build and the pipeline reject exactly the same invalid records.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { instrumentSchema, initiativeSchema, fundSchema } from './schema.mjs';

export { JURISDICTIONS, STREAMS, INSTRUMENT_STATUS } from './schema.mjs';

const instruments = defineCollection({ loader: glob({ pattern: '*.json', base: './data/instruments' }), schema: instrumentSchema });
const initiatives = defineCollection({ loader: glob({ pattern: '*.json', base: './data/initiatives' }), schema: initiativeSchema });
const funds = defineCollection({ loader: glob({ pattern: '*.json', base: './data/funds' }), schema: fundSchema });

export const collections = { instruments, initiatives, funds };

import { createEdgeSeoHandler } from './_lib/edge-seo.js';

// Public HTML navigations only; /api/* and /image/* pass straight through to their own
// Functions, and static asset folders are excluded from Functions in public/_routes.json.
export const onRequest = createEdgeSeoHandler();

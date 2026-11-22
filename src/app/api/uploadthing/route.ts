import { createRouteHandler } from 'uploadthing/next';
import { uploadRouter } from './core';

// Requer UPLOADTHING_TOKEN no ambiente. Sem ele, o painel usa o upload local (/api/admin/upload).
export const { GET, POST } = createRouteHandler({ router: uploadRouter });

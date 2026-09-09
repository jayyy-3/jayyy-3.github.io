import { handlePublicImageQrDataRequest } from '../../_lib/admin-image-qr.js';

export async function onRequest(context) {
  if (!['GET', 'HEAD'].includes(context.request.method)) {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' } });
  }
  return handlePublicImageQrDataRequest(context.request, context.env, context.params.slug);
}

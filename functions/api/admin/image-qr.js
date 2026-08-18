import {
  adminImageQrMethodNotAllowedResponse,
  adminImageQrOptionsResponse,
  handleAdminImageQrRequest,
} from '../../_lib/admin-image-qr.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return adminImageQrOptionsResponse();
  if (!['GET', 'POST'].includes(context.request.method)) {
    return adminImageQrMethodNotAllowedResponse();
  }
  return handleAdminImageQrRequest(context.request, context.env);
}

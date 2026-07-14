import {
  adminProjectsMethodNotAllowedResponse,
  adminProjectsOptionsResponse,
  handleAdminProjectsRequest,
} from '../../_lib/admin-projects.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return adminProjectsOptionsResponse();
  }

  if (!['GET', 'POST'].includes(context.request.method)) {
    return adminProjectsMethodNotAllowedResponse();
  }

  return handleAdminProjectsRequest(context.request, context.env);
}

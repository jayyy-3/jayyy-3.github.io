import {
  adminInviteMethodNotAllowedResponse,
  adminInviteOptionsResponse,
  handleAdminInviteUserRequest,
} from '../../_lib/admin-invite.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return adminInviteOptionsResponse();
  }

  if (context.request.method !== 'POST') {
    return adminInviteMethodNotAllowedResponse();
  }

  return handleAdminInviteUserRequest(context.request, context.env);
}

import {
  handleSampleRequest,
  methodNotAllowedResponse,
  optionsResponse,
} from '../_lib/forms.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (context.request.method !== 'POST') {
    return methodNotAllowedResponse();
  }

  return handleSampleRequest(context.request, context.env);
}

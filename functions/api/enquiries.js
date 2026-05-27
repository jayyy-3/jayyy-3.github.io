import {
  handleEnquiryRequest,
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

  return handleEnquiryRequest(context.request, context.env);
}

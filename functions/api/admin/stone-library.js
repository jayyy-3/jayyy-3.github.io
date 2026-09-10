import { handleStoneRequest } from '../../_lib/admin-stones.js';
export function onRequest({ request, env }) {
  return handleStoneRequest(request, env);
}

import { supabase } from './supabaseClient';
import {
  StoneApiError,
  type StoneWrite,
} from '../features/stone-library/stoneSaveQueue';
export {
  StoneApiError,
  StoneSaveQueue,
  type StoneWrite,
} from '../features/stone-library/stoneSaveQueue';
export async function stoneApi<T>(query = '', body?: StoneWrite): Promise<T> {
  const session = await supabase?.auth.getSession();
  const token = session?.data.session?.access_token;
  if (!token)
    throw new StoneApiError(
      'Sign in again to continue. Your edits are kept here.',
      401,
      'session',
    );
  let response: Response;
  try {
    response = await fetch(`/api/admin/stone-library${query}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(45000),
    });
  } catch {
    throw new StoneApiError(
      'Connection interrupted. Your edits are kept here. Retry to confirm the save.',
      0,
      'uncertain',
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data)
    throw new StoneApiError(
      data?.message ||
        'The editor could not confirm this request. Retry to check its result.',
      response.status,
      data?.error || 'uncertain',
      data?.references,
    );
  return data as T;
}

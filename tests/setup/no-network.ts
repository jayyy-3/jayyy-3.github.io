// Unit tests must never reach Supabase, email providers or any other host.
// Suites that exercise HTTP code paths replace fetch with an in-memory mock and
// restore this guard afterwards; an unmocked request fails the test loudly.
globalThis.fetch = async (input: RequestInfo | URL) => {
  const url = input instanceof Request ? input.url : String(input)
  throw new Error(`Network access is disabled in unit tests: ${url}`)
}

class NoNetworkWebSocket {
  constructor() {
    throw new Error('WebSocket connections are disabled in unit tests')
  }
}
globalThis.WebSocket = NoNetworkWebSocket as unknown as typeof WebSocket

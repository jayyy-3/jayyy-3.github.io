// Cloudflare Workers globals used by the Pages Functions, for `tsc -p tsconfig.functions.json`
// only. Kept outside functions/ so Pages never treats it as a route; a deliberately small
// subset instead of a @cloudflare/workers-types dependency.
declare class HTMLRewriter {
  on(
    selector: string,
    handlers: {
      element?(element: { remove(): void; append(content: string, options?: { html?: boolean }): void }): void;
    },
  ): HTMLRewriter;
  transform(response: Response): Response;
}

interface CacheStorage {
  readonly default: Cache;
}

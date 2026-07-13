export function toCanonicalContentKey(value: string): string {
    return value.trim().toLowerCase();
}

/**
 * Keeps the established fallback order, replaces matching fallback records with
 * their Published CMS record, then appends Published records that have no
 * fallback counterpart.
 */
export function overlayPublishedContent<T>(
    fallbackItems: readonly T[],
    publishedItems: readonly T[],
    getCanonicalKey: (item: T) => string,
): T[] {
    const publishedByKey = new Map<string, T>();

    for (const item of publishedItems) {
        publishedByKey.set(toCanonicalContentKey(getCanonicalKey(item)), item);
    }

    const fallbackKeys = new Set<string>();
    const merged = fallbackItems.map((item) => {
        const key = toCanonicalContentKey(getCanonicalKey(item));
        fallbackKeys.add(key);
        return publishedByKey.get(key) ?? item;
    });

    for (const [key, item] of publishedByKey) {
        if (!fallbackKeys.has(key)) {
            merged.push(item);
            fallbackKeys.add(key);
        }
    }

    return merged;
}

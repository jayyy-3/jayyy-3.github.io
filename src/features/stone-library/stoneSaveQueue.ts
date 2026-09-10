import type { StoneDraft, StoneEnvelope, StoneReference } from './stoneDraft';
export interface StoneWrite {
  action: 'save' | 'publish' | 'archive';
  stoneId: number | null;
  revision: number;
  liveVersion: string | null;
  requestId: string;
  draft: StoneDraft;
}
export class StoneApiError extends Error {
  status: number;
  code: string;
  references: StoneReference[];
  constructor(
    message: string,
    status: number,
    code: string,
    references: StoneReference[] = [],
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.references = references;
  }
}
/** Serial, coalescing draft queue. A lost response retains the exact request for replay. */
export class StoneSaveQueue {
  draft: StoneDraft;
  envelope: StoneEnvelope | null;
  state: 'saved' | 'waiting' | 'saving' | 'error' = 'saved';
  error: Error | null = null;
  private generation = 0;
  private savedGeneration = 0;
  private pending: { body: StoneWrite; generation: number } | null = null;
  private running: Promise<void> | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  onChange: () => void = () => {};
  private send: (body: StoneWrite) => Promise<StoneEnvelope>;
  constructor(
    draft: StoneDraft,
    envelope: StoneEnvelope | null,
    send: (body: StoneWrite) => Promise<StoneEnvelope>,
  ) {
    this.draft = draft;
    this.envelope = envelope;
    this.send = send;
  }
  get dirty() {
    return this.generation !== this.savedGeneration || this.pending !== null;
  }
  change(draft: StoneDraft) {
    this.draft = draft;
    this.generation++;
    if (this.timer) clearTimeout(this.timer);
    if (this.state !== 'error') {
      this.state = 'waiting';
      this.timer = setTimeout(() => {
        void this.flush().catch(() => {});
      }, 1000);
    }
    this.onChange();
  }
  flush(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    if (this.running) return this.running;
    this.running = this.drain().finally(() => {
      this.running = null;
    });
    return this.running;
  }
  private async drain() {
    while (this.dirty) {
      if (!this.pending)
        this.pending = {
          generation: this.generation,
          body: {
            action: 'save',
            stoneId: this.envelope?.stoneId || null,
            revision: this.envelope?.revision || 0,
            liveVersion: this.envelope?.liveVersion || null,
            requestId: crypto.randomUUID(),
            draft: structuredClone(this.draft),
          },
        };
      this.state = 'saving';
      this.error = null;
      this.onChange();
      const attempt = this.pending;
      try {
        const next = await this.send(attempt.body);
        this.envelope = next;
        this.savedGeneration = attempt.generation;
        // Server assigns the first parent ID. Never replace newer text with an older response.
        this.draft =
          this.generation === attempt.generation
            ? next.draft
            : {
                ...this.draft,
                stone: { ...this.draft.stone, id: next.stoneId },
              };
        this.pending = null;
        this.state = this.dirty ? 'waiting' : 'saved';
        this.onChange();
      } catch (error) {
        this.error = error instanceof Error ? error : new Error('Save failed.');
        this.state = 'error';
        // Definite validation failures can be corrected. Conflicts and unknown commits retain identity.
        if (
          error instanceof StoneApiError &&
          error.status >= 400 &&
          error.status < 500 &&
          error.status !== 409 &&
          error.status !== 401
        )
          this.pending = null;
        this.onChange();
        throw this.error;
      }
    }
  }
  accept(envelope: StoneEnvelope) {
    this.envelope = envelope;
    this.draft = envelope.draft;
    this.savedGeneration = this.generation;
    this.pending = null;
    this.error = null;
    this.state = 'saved';
    this.onChange();
  }
  dispose() {
    if (this.timer) clearTimeout(this.timer);
    this.onChange = () => {};
  }
}

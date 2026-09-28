import { describe, expect, it, vi } from 'vitest';
import {
    assigneeName,
    buildLeadExportCsv,
    fetchSampleItemsForRequests,
    getLeadWorkflowStatusSummary,
    getWorkflowGuidance,
    leadToForm,
    mergeLeadTimeline,
} from './AdminLeadsPage';

// The inbox module imports the browser Supabase client; tests never talk to Supabase.
vi.mock('../../lib/supabaseClient', () => ({
    supabase: null,
    supabaseConfig: { url: 'https://supabase.invalid', hasBrowserKey: false },
}));

type ExportArgs = Parameters<typeof buildLeadExportCsv>;
type Enquiry = ExportArgs[0][number];
type SampleRequest = ExportArgs[1][number];

const enquiry: Enquiry = {
    id: 101,
    status: 'contacted',
    name: 'Alex Designer',
    email: 'alex@example.test',
    phone: null,
    company: 'Studio, "Example"',
    project_type: 'Streetscape',
    message: 'Line one\nLine two',
    source_route: '/contact',
    turnstile_success: true,
    notification_status: 'sent',
    assigned_to: 'user-1',
    internal_notes: null,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-02T00:00:00Z',
};
const sample: SampleRequest = {
    id: 202,
    status: 'packed',
    name: 'Mia Contractor',
    email: 'mia@example.test',
    phone: '0400 000 000',
    company: null,
    shipping_address: '5 Test St, Melbourne VIC 3000',
    project_name: 'Civic plaza',
    message: null,
    source_route: '/stone-library?intent=sample-request',
    turnstile_success: null,
    notification_status: 'failed',
    assigned_to: 'user-gone',
    internal_notes: 'Courier booked',
    created_at: '2026-09-03T00:00:00Z',
    updated_at: '2026-09-04T00:00:00Z',
};

describe('Leads inbox', () => {
    it('exports enquiries and sample requests as quoted CSV with readable owners, pages, checks and requested samples', () => {
        const csv = buildLeadExportCsv(
            [enquiry],
            [sample],
            [
                { id: 1, sample_request_id: 202, stone_group_id: 5, finish_definition_id: 8, quantity: 2, notes: 'Honed edge' },
                { id: 2, sample_request_id: 202, stone_group_id: 99, finish_definition_id: null, quantity: 1, notes: null },
                { id: 3, sample_request_id: 999, stone_group_id: 5, finish_definition_id: 8, quantity: 1, notes: null },
            ],
            [{ user_id: 'user-1', email: 'lead@example.test', display_name: 'Lead Owner', role: 'admin', is_active: true }],
            [{ id: 5, display_name: 'Zen Grey' }],
            [{ id: 8, display_name: 'Honed' }],
        );
        const lines = csv.split('\n');

        expect(csv.endsWith('\n')).toBe(true);
        expect(lines[0]).toBe(
            '"Lead type","Reference","Workflow status","Created","Last updated","Name","Email","Phone","Company","Project context","Website page","Email delivery","Spam check","Assigned owner","Customer message","Shipping address","Requested samples","Internal notes"',
        );
        expect(csv).toContain(
            '"Enquiry","enquiry-101","contacted","2026-09-01T00:00:00Z","2026-09-02T00:00:00Z","Alex Designer","alex@example.test","","Studio, ""Example""","Streetscape","Contact page","Email sent","Spam check passed","Lead Owner","Line one\nLine two","","",""',
        );
        expect(csv).toContain(
            '"Sample request","sample-202","packed","2026-09-03T00:00:00Z","2026-09-04T00:00:00Z","Mia Contractor","mia@example.test","0400 000 000","","Civic plaza","Stone Library / Sample request","Email delivery failed","Spam check not recorded","Team member not found","","5 Test St, Melbourne VIC 3000","Zen Grey / Honed / qty 2; notes: Honed edge | Stone not found / Finish not selected / qty 1","Courier booked"',
        );
        expect(buildLeadExportCsv([], [], [], [], [], []).trim().split('\n')).toHaveLength(1);
    });

    it('seeds the workflow form from the selected lead and gives stage-specific guidance and save readiness', () => {
        expect(leadToForm('enquiry', 101, [enquiry], [sample])).toEqual({ status: 'contacted', assignedTo: 'user-1', internalNotes: '' });
        expect(leadToForm('sample', 202, [enquiry], [sample])).toEqual({ status: 'packed', assignedTo: 'user-gone', internalNotes: 'Courier booked' });
        expect(leadToForm('sample', 101, [enquiry], [sample])).toEqual({ status: 'new', assignedTo: '', internalNotes: '' });
        expect(leadToForm(null, null, [enquiry], [sample])).toEqual({ status: 'new', assignedTo: '', internalNotes: '' });

        expect(getWorkflowGuidance('enquiry', 'contacted').title).toBe('Qualify the project');
        expect(getWorkflowGuidance('sample', 'packed').title).toBe('Dispatch and record the handoff');
        expect(getWorkflowGuidance('sample', 'quoted').title).toBe('Confirm details with the customer');
        expect(getWorkflowGuidance('enquiry', 'unknown').title).toBe('Make first contact');
        expect(getWorkflowGuidance('sample', 'spam').title).toBe('No customer follow-up');
        expect(getWorkflowGuidance('enquiry', 'closed').title).toBe('Conversation closed');

        const summary = (kind: 'enquiry' | 'sample', status: string, owner: boolean, notes: boolean) =>
            getLeadWorkflowStatusSummary(kind, status, owner, notes);
        expect(summary('enquiry', 'new', false, true)).toMatchObject({ badge: 'Assign owner', tone: 'attention' });
        expect(summary('enquiry', 'contacted', true, false)).toMatchObject({ badge: 'Add notes', tone: 'attention' });
        expect(summary('sample', 'sent', true, true)).toMatchObject({
            title: 'Sample request is ready for the next step',
            badge: 'Ready to save',
            tone: 'ready',
        });
        expect(summary('enquiry', 'won', false, false)).toMatchObject({ badge: 'Add notes', tone: 'attention' });
        expect(summary('enquiry', 'closed', false, true)).toMatchObject({ badge: 'Handled', tone: 'done' });
        expect(summary('sample', 'spam', false, false)).toMatchObject({ badge: 'Not active', tone: 'done' });
    });
});

type ItemRow = { id: number; sample_request_id: number; stone_group_id: null; finish_definition_id: null; quantity: number; notes: string };

// In-memory stand-in for the PostgREST builder used by fetchSampleItemsForRequests. It applies
// in/order/range like the server and caps every response at max_rows (1000).
function fakeItemsClient(rows: ItemRow[], calls: Array<{ ids: number[]; from: number; to: number }>) {
    return {
        from: () => {
            let ids: number[] = [];
            let from = 0;
            let to = Number.MAX_SAFE_INTEGER;
            const builder = {
                select: () => builder,
                in: (_column: string, values: number[]) => {
                    ids = values;
                    return builder;
                },
                order: () => builder,
                range: (start: number, end: number) => {
                    from = start;
                    to = end;
                    return builder;
                },
                returns: () => {
                    calls.push({ ids, from, to });
                    const matched = rows
                        .filter((row) => ids.includes(row.sample_request_id))
                        .sort((left, right) => left.sample_request_id - right.sample_request_id || left.id - right.id);
                    return Promise.resolve({ data: matched.slice(from, Math.min(to + 1, from + 1000)), error: null, status: 200 });
                },
            };
            return builder;
        },
    } as unknown as Parameters<typeof fetchSampleItemsForRequests>[0];
}

describe('Leads queue loading', () => {
    it('reads every item of the loaded requests even when 600+ older items exist (old query: oldest 500 only)', async () => {
        const rows: ItemRow[] = [];
        let id = 0;
        for (let request = 1; request <= 130; request += 1) {
            for (let item = 0; item < 5; item += 1) rows.push({ id: ++id, sample_request_id: request, stone_group_id: null, finish_definition_id: null, quantity: 1, notes: 'older' });
        }
        for (let request = 131; request <= 133; request += 1) {
            for (let item = 0; item < 4; item += 1) rows.push({ id: ++id, sample_request_id: request, stone_group_id: null, finish_definition_id: null, quantity: 1, notes: 'newest' });
        }
        // The old query (id ascending, limit 500) never reached the newest requests.
        expect(rows.slice(0, 500).some((row) => row.sample_request_id > 130)).toBe(false);

        const calls: Array<{ ids: number[]; from: number; to: number }> = [];
        const newestFirst = Array.from({ length: 100 }, (_, index) => 133 - index);
        const result = await fetchSampleItemsForRequests(fakeItemsClient(rows, calls), newestFirst);
        expect(result.error).toBeNull();
        for (const request of [131, 132, 133]) {
            expect(result.data?.filter((row) => row.sample_request_id === request)).toHaveLength(4);
        }
        expect(result.data).toHaveLength(97 * 5 + 3 * 4);
        expect(calls).toEqual([{ ids: newestFirst, from: 0, to: 999 }]);
    });

    it('chunks request ids and pages past the 1000-row cap', async () => {
        const rows: ItemRow[] = Array.from({ length: 2600 }, (_, index) => ({
            id: index + 1,
            sample_request_id: (index % 260) + 1,
            stone_group_id: null,
            finish_definition_id: null,
            quantity: 1,
            notes: 'x',
        }));
        const calls: Array<{ ids: number[]; from: number; to: number }> = [];
        const ids = Array.from({ length: 260 }, (_, index) => index + 1);
        const result = await fetchSampleItemsForRequests(fakeItemsClient(rows, calls), ids);
        expect(result.data).toHaveLength(2600);
        expect(calls.map((call) => [call.ids.length, call.from])).toEqual([
            // 100 requests x 10 items fill a whole page, so the next page is read (and is empty).
            [100, 0],
            [100, 1000],
            [100, 0],
            [100, 1000],
            [60, 0],
        ]);
        expect(await fetchSampleItemsForRequests(fakeItemsClient(rows, []), [])).toEqual({ data: [], error: null });
    });

    it('returns the error of a failed items request so the screen can translate it', async () => {
        const failing = {
            from: () => {
                const builder = {
                    select: () => builder,
                    in: () => builder,
                    order: () => builder,
                    range: () => builder,
                    returns: () => Promise.resolve({ data: null, error: { code: '42501', message: 'permission denied' }, status: 403 }),
                };
                return builder;
            },
        } as unknown as Parameters<typeof fetchSampleItemsForRequests>[0];
        expect(await fetchSampleItemsForRequests(failing, [1])).toEqual({
            data: null,
            error: { code: '42501', message: 'permission denied' },
            status: 403,
        });
    });

    it('merges both lead tables newest first and holds back rows below the loaded horizon', () => {
        const lead = (id: number, day: number) => ({ id, createdAt: `2026-09-${String(day).padStart(2, '0')}T00:00:00Z` });
        const enquiries = [lead(1, 20), lead(2, 10), lead(3, 2)];
        const samples = [lead(7, 25), lead(8, 15)];
        // Samples were cut off at the limit: nothing older than 15 Sep is certain yet.
        expect(mergeLeadTimeline(enquiries, samples, { enquiry: true, sample: false }).map((row) => row.id)).toEqual([7, 1, 8]);
        // Everything loaded: the full timeline.
        expect(mergeLeadTimeline(enquiries, samples, { enquiry: true, sample: true }).map((row) => row.id)).toEqual([7, 1, 8, 2, 3]);
        // Both cut off: the later of the two oldest rows is the horizon.
        expect(mergeLeadTimeline(enquiries, samples, { enquiry: false, sample: false }).map((row) => row.id)).toEqual([7, 1, 8]);
        expect(mergeLeadTimeline([], [], { enquiry: true, sample: true })).toEqual([]);
    });

    it('names assignees for the full team, and as another colleague when an Editor only sees their own profile', () => {
        const admins = [{ user_id: 'user-1', email: 'editor@example.test', display_name: 'Sales Editor', role: 'editor', is_active: true }];
        expect(assigneeName(null, admins, false)).toBe('Unassigned');
        expect(assigneeName('user-1', admins, false)).toBe('Sales Editor');
        expect(assigneeName('user-2', admins, false)).toBe('Another team member');
        expect(assigneeName('user-2', admins, true)).toBe('Team member not found');
    });
});

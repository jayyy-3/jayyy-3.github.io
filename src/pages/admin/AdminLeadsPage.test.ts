import { describe, expect, it, vi } from 'vitest';
import { buildLeadExportCsv, getLeadWorkflowStatusSummary, getWorkflowGuidance, leadToForm } from './AdminLeadsPage';

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

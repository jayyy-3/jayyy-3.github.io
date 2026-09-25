import { describe, expect, it, vi } from 'vitest';
import {
    normalizeFooterColumns,
    serializeFooterColumns,
    validateAdminInviteForm,
    validateAdminProfileForm,
    validateSettings,
} from './AdminSettingsPage';

// The editor module imports the browser Supabase client; tests never talk to Supabase.
vi.mock('../../lib/supabaseClient', () => ({
    supabase: null,
    supabaseConfig: { url: 'https://supabase.invalid', hasBrowserKey: false },
}));

type SettingsForm = Parameters<typeof validateSettings>[0];
type FooterColumns = Parameters<typeof serializeFooterColumns>[0];
type ProfileForm = Parameters<typeof validateAdminProfileForm>[0];
type ProfileRow = Parameters<typeof validateAdminProfileForm>[1]['existingProfiles'][number];

const ownerId = '11111111-1111-4111-8111-111111111111';
const adminId = '22222222-2222-4222-8222-222222222222';
const newUserId = '33333333-3333-4333-8333-333333333333';
const profile = (overrides: Partial<ProfileRow>): ProfileRow => ({
    user_id: ownerId,
    email: 'owner@example.test',
    display_name: null,
    role: 'owner',
    is_active: true,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
    ...overrides,
});
const team = [profile({}), profile({ user_id: adminId, email: 'admin@example.test', role: 'admin' })];

describe('Settings editor', () => {
    it('round-trips stored footer JSON through the editor form, dropping address rows and malformed entries', () => {
        const stored = [
            { title: 'Contact', items: [{ label: 'Email', value: 'info@urblo.com.au' }, { label: 'Office', value: '1 Old St' }] },
            {
                title: 'Explore',
                items: [
                    { label: 'Projects', to: '/projects' },
                    { label: 'Instagram', href: 'https://instagram.com/urblo' },
                    'not an item',
                ],
            },
            'not a column',
        ];
        const form = normalizeFooterColumns(stored);
        expect(form).toEqual([
            { title: 'Contact', items: [{ label: 'Email', destinationKind: 'text', destination: 'info@urblo.com.au' }] },
            {
                title: 'Explore',
                items: [
                    { label: 'Projects', destinationKind: 'internal', destination: '/projects' },
                    { label: 'Instagram', destinationKind: 'external', destination: 'https://instagram.com/urblo' },
                ],
            },
        ]);
        expect(serializeFooterColumns(form)).toEqual({
            error: null,
            value: [
                { title: 'Contact', items: [{ label: 'Email', value: 'info@urblo.com.au' }] },
                {
                    title: 'Explore',
                    items: [
                        { label: 'Projects', to: '/projects' },
                        { label: 'Instagram', href: 'https://instagram.com/urblo' },
                    ],
                },
            ],
        });
    });

    it('rejects unsafe or incomplete footer links before Save', () => {
        const column = (items: FooterColumns[number]['items'], title = 'Explore'): FooterColumns => [{ title, items }];
        expect(serializeFooterColumns(column([{ label: 'Evil', destinationKind: 'internal', destination: '//evil.example/path' }])).error).toBe(
            'Internal footer links must start with one `/` and use a valid site path.',
        );
        expect(serializeFooterColumns(column([{ label: 'Evil', destinationKind: 'external', destination: 'javascript:alert(1)' }])).error).toBe(
            'External footer links must be valid `https://` or `http://` URLs.',
        );
        expect(serializeFooterColumns(column([{ label: ' ', destinationKind: 'text', destination: 'x' }])).error).toBe(
            'Every footer item needs a label and text or link destination.',
        );
        expect(serializeFooterColumns(column([])).error).toBe('Every footer column needs at least one item.');
        expect(serializeFooterColumns(column([{ label: 'A', destinationKind: 'text', destination: 'B' }], 'x'.repeat(81))).error).toBe(
            'Every footer column needs a title of 80 characters or fewer.',
        );
        const seven = Array.from({ length: 7 }, () => column([{ label: 'A', destinationKind: 'text', destination: 'B' }])[0]);
        expect(serializeFooterColumns(seven).error).toBe('Footer content supports up to 6 columns.');
        expect(serializeFooterColumns(column([{ label: 'Contact', destinationKind: 'internal', destination: '/projects/../contact' }])).value).toEqual([
            { title: 'Explore', items: [{ label: 'Contact', to: '/contact' }] },
        ]);
    });

    it('saves company addresses into the Contact footer column and normalizes Published fields', () => {
        const form: SettingsForm = {
            status: 'published',
            companyName: '  Urblo   Studio ',
            primaryEmail: 'info@urblo.com.au',
            primaryPhone: '',
            instagram: '',
            linkedin: '',
            seoTitle: '',
            seoDescription: '',
            defaultShareImage: '',
            officeAddress: ' 1 Office   Rd ',
            warehouseAddress: '2 Warehouse Rd',
            footerColumns: [{ title: 'Explore', items: [{ label: 'Projects', destinationKind: 'internal', destination: '/projects' }] }],
        };
        const result = validateSettings(form);
        expect(result.error).toBeNull();
        expect(result.footerColumns).toEqual([
            { title: 'Contact', items: [{ label: 'Office', value: '1 Office Rd' }, { label: 'Warehouse', value: '2 Warehouse Rd' }] },
            { title: 'Explore', items: [{ label: 'Projects', to: '/projects' }] },
        ]);
        expect(result.publishedFields).toMatchObject({ companyName: 'Urblo Studio', primaryEmail: 'info@urblo.com.au' });

        expect(validateSettings({ ...form, status: 'draft' }).publishedFields).toBeNull();
        expect(validateSettings({ ...form, companyName: ' ' }).error).toBe('Company name is required.');
        expect(validateSettings({ ...form, warehouseAddress: 'x'.repeat(161) }).error).toMatch(/Office and Warehouse addresses are required/);
        expect(
            validateSettings({ ...form, footerColumns: [{ title: 'Contact', items: [{ label: 'Address', destinationKind: 'text', destination: 'Manual' }] }] }).error,
        ).toBe('Edit company addresses in the Company addresses fields above.');
        expect(validateSettings({ ...form, primaryEmail: 'not-an-email' }).error).toBe('Published settings need a valid primary email address.');
    });

    it('keeps team access role boundaries: owner-only Owner grants, no self-demotion, one active owner, unique emails', () => {
        const grant: ProfileForm = { userId: newUserId, email: 'new@example.test', displayName: '', role: 'editor', isActive: true };
        const asAdmin = { currentRole: 'admin' as const, currentUserId: adminId, editingUserId: null, existingProfiles: team };
        const asOwner = { ...asAdmin, currentRole: 'owner' as const, currentUserId: ownerId };

        expect(validateAdminProfileForm(grant, asAdmin)).toBeNull();
        expect(validateAdminProfileForm({ ...grant, userId: 'not-a-uuid' }, asAdmin)).toBe('Paste a valid login account ID before granting CMS access.');
        expect(validateAdminProfileForm({ ...grant, userId: adminId }, asAdmin)).toBe('This login account already has CMS access.');
        expect(validateAdminProfileForm({ ...grant, email: 'ADMIN@example.test' }, asAdmin)).toBe('This email is already assigned to another CMS user.');
        expect(validateAdminProfileForm({ ...grant, role: 'owner' }, asAdmin)).toBe('Only a website owner can assign the Website owner role.');
        expect(validateAdminProfileForm({ ...grant, role: 'owner' }, asOwner)).toBeNull();
        expect(
            validateAdminProfileForm({ userId: ownerId, email: 'owner@example.test', displayName: '', role: 'admin', isActive: true }, { ...asAdmin, editingUserId: ownerId }),
        ).toBe('Only a website owner can change Website owner access.');
        expect(
            validateAdminProfileForm({ userId: adminId, email: 'admin@example.test', displayName: '', role: 'editor', isActive: true }, { ...asAdmin, editingUserId: adminId }),
        ).toBe('Do not remove your own active CMS manager access from this screen.');
        expect(
            validateAdminProfileForm({ userId: ownerId, email: 'owner@example.test', displayName: '', role: 'admin', isActive: true }, { ...asOwner, currentUserId: adminId, editingUserId: ownerId }),
        ).toBe('At least one active website owner must remain.');

        const invite = { email: 'invitee@example.test', displayName: '', role: 'editor' as const };
        expect(validateAdminInviteForm(invite, { currentRole: 'admin', existingProfiles: team })).toBeNull();
        expect(validateAdminInviteForm({ ...invite, email: 'bad' }, { currentRole: 'admin', existingProfiles: team })).toBe('Enter a valid invite email address.');
        expect(validateAdminInviteForm({ ...invite, email: ' Owner@Example.test ' }, { currentRole: 'owner', existingProfiles: team })).toBe('This email already has CMS access.');
        expect(validateAdminInviteForm({ ...invite, role: 'owner' }, { currentRole: 'admin', existingProfiles: team })).toBe('Only a website owner can invite another Website owner.');
        expect(validateAdminInviteForm({ ...invite, role: 'owner' }, { currentRole: 'owner', existingProfiles: team })).toBeNull();
    });
});

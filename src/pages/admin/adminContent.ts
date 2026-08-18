import {
    Archive,
    BookOpenText,
    Boxes,
    FileText,
    QrCode,
    Image,
    LayoutDashboard,
    Mailbox,
    Settings,
    ShieldCheck,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type AdminModuleKey =
    | 'dashboard'
    | 'leads'
    | 'media'
    | 'image-qr'
    | 'stone-library'
    | 'projects'
    | 'products'
    | 'articles'
    | 'settings'
    | 'audit';

export interface AdminModuleDefinition {
    key: AdminModuleKey;
    label: string;
    path: string;
    summary: string;
    handoffLabel: string;
    group: 'work' | 'content' | 'operations';
    Icon: ComponentType<{ className?: string }>;
}

export const adminModules: AdminModuleDefinition[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        path: '/admin',
        summary: 'Start here for content health, lead signal, and the next editing job.',
        handoffLabel: 'Private CMS access',
        group: 'work',
        Icon: LayoutDashboard,
    },
    {
        key: 'leads',
        label: 'Leads',
        path: '/admin/leads',
        summary: 'Contact enquiries and sample requests with owner, status, notes, and export controls.',
        handoffLabel: 'Customer inbox',
        group: 'work',
        Icon: Mailbox,
    },
    {
        key: 'media',
        label: 'Media',
        path: '/admin/media',
        summary: 'Images and files with alt text, usage notes, public/private library state, and export controls.',
        handoffLabel: 'Media library',
        group: 'content',
        Icon: Image,
    },
    {
        key: 'image-qr',
        label: 'Image QR',
        path: '/admin/image-qr',
        summary: 'Upload optimized images and manage stable links with downloadable QR codes.',
        handoffLabel: 'One image, one QR',
        group: 'content',
        Icon: QrCode,
    },
    {
        key: 'stone-library',
        label: 'Stone Library',
        path: '/admin/stone-library',
        summary: 'Stone families, variants, finish availability, and finish imagery readiness.',
        handoffLabel: 'Stone data',
        group: 'content',
        Icon: Archive,
    },
    {
        key: 'projects',
        label: 'Projects',
        path: '/admin/projects',
        summary: 'Edit case studies, galleries, facts, materials, and project images in one place.',
        handoffLabel: 'Uses Media and Stone Library',
        group: 'content',
        Icon: FileText,
    },
    {
        key: 'products',
        label: 'Products',
        path: '/admin/products',
        summary: 'Product families, models, specs, default materials, and publish readiness.',
        handoffLabel: 'Uses Stone Library materials',
        group: 'content',
        Icon: Boxes,
    },
    {
        key: 'articles',
        label: 'Articles',
        path: '/admin/articles',
        summary: 'Article details, cover media, search previews, and Article sections.',
        handoffLabel: 'Article sections',
        group: 'content',
        Icon: BookOpenText,
    },
    {
        key: 'settings',
        label: 'Settings',
        path: '/admin/settings',
        summary: 'Site identity, footer links, search defaults, and CMS access roles.',
        handoffLabel: 'Website owner / CMS manager',
        group: 'operations',
        Icon: Settings,
    },
    {
        key: 'audit',
        label: 'Change history',
        path: '/admin/audit',
        summary: 'Saved changes, publish events, exports, and sensitive operation review.',
        handoffLabel: 'Read-only history',
        group: 'operations',
        Icon: ShieldCheck,
    },
];

export function getAdminModule(key: AdminModuleKey) {
    return adminModules.find((module) => module.key === key) ?? adminModules[0];
}

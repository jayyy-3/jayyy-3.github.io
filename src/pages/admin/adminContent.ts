import {
    Archive,
    BookOpenText,
    Boxes,
    FileText,
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
    dependency: string;
    state: 'active' | 'scaffold' | 'locked';
    Icon: ComponentType<{ className?: string }>;
}

export const adminModules: AdminModuleDefinition[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        path: '/admin',
        summary: 'Content health, live leads, launch warnings, and next operational checks.',
        dependency: 'Supabase Auth + admin_profiles',
        state: 'active',
        Icon: LayoutDashboard,
    },
    {
        key: 'leads',
        label: 'Leads',
        path: '/admin/leads',
        summary: 'Contact enquiries and sample requests with owner, status, notes, and export controls.',
        dependency: 'Forms live-write verification',
        state: 'active',
        Icon: Mailbox,
    },
    {
        key: 'media',
        label: 'Media',
        path: '/admin/media',
        summary: 'Storage-backed media records, alt text, usage notes, and publication state.',
        dependency: 'Supabase Storage + media_assets RLS',
        state: 'active',
        Icon: Image,
    },
    {
        key: 'stone-library',
        label: 'Stone Library',
        path: '/admin/stone-library',
        summary: 'Stone groups, variants, finish capabilities, and source imagery readiness.',
        dependency: 'Stone Library tables + admin_profiles RLS',
        state: 'active',
        Icon: Archive,
    },
    {
        key: 'projects',
        label: 'Projects',
        path: '/admin/projects',
        summary: 'Case studies, galleries, material maps, hotspot facts, and claim review state.',
        dependency: 'Media and Stone Library references',
        state: 'active',
        Icon: FileText,
    },
    {
        key: 'products',
        label: 'Products',
        path: '/admin/products',
        summary: 'Product families, models, specs, and default material references.',
        dependency: 'Stable Stone Library references',
        state: 'active',
        Icon: Boxes,
    },
    {
        key: 'articles',
        label: 'Articles',
        path: '/admin/articles',
        summary: 'Structured article blocks, cover media, SEO, and claim-safe editorial review.',
        dependency: 'Article block migration',
        state: 'active',
        Icon: BookOpenText,
    },
    {
        key: 'settings',
        label: 'Settings',
        path: '/admin/settings',
        summary: 'Site settings, notification routing, admin users, and ownership controls.',
        dependency: 'Owner/admin role verification',
        state: 'active',
        Icon: Settings,
    },
    {
        key: 'audit',
        label: 'Audit',
        path: '/admin/audit',
        summary: 'Mutation history, publish events, and sensitive operation review.',
        dependency: 'Admin mutation helpers',
        state: 'scaffold',
        Icon: ShieldCheck,
    },
];

export function getAdminModule(key: AdminModuleKey) {
    return adminModules.find((module) => module.key === key) ?? adminModules[0];
}

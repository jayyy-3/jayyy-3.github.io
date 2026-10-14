import { BLOCK_TEXT_LIMITS, BLOCK_URL_LIMIT, isSafeBlockHref } from '../../../features/blocks/schema';
import { BlockTextArea, BlockTextField } from './BlockFormControls';
import type { BlockFormProps } from './blockFormTypes';

const linkHint = (href: string) =>
  href.trim() && !isSafeBlockHref(href) ? 'Use a page on this site such as /contact, or a full https:// address.' : undefined;

export default function CtaForm({ content, onChange }: BlockFormProps<'cta'>) {
  const secondary = content.secondary ?? { label: '', href: '' };
  return (
    <div className="grid gap-4">
      <BlockTextField label="Prompt" value={content.title} maxLength={BLOCK_TEXT_LIMITS.title} placeholder="Planning a similar project?" onChange={(title) => onChange({ ...content, title })} />
      <BlockTextArea label="Supporting text" value={content.body} maxLength={BLOCK_TEXT_LIMITS.short} rows={2} onChange={(body) => onChange({ ...content, body })} />
      <div className="grid gap-4 md:grid-cols-2">
        <BlockTextField label="Button text" value={content.primary.label} maxLength={BLOCK_TEXT_LIMITS.title} onChange={(label) => onChange({ ...content, primary: { ...content.primary, label } })} />
        <BlockTextField label="Button link" value={content.primary.href} maxLength={BLOCK_URL_LIMIT} hint={linkHint(content.primary.href)} onChange={(href) => onChange({ ...content, primary: { ...content.primary, href } })} />
        <BlockTextField label="Second button text (optional)" value={secondary.label} maxLength={BLOCK_TEXT_LIMITS.title} onChange={(label) => onChange({ ...content, secondary: { ...secondary, label } })} />
        <BlockTextField label="Second button link (optional)" value={secondary.href} maxLength={BLOCK_URL_LIMIT} hint={linkHint(secondary.href)} onChange={(href) => onChange({ ...content, secondary: { ...secondary, href } })} />
      </div>
    </div>
  );
}

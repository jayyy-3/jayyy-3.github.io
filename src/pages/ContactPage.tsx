import { usePublicSiteSettings } from '../lib/publicSiteSettings';
import { companyLocationLabels } from '../lib/companyLocations';
import { ArrowUpRight, CheckCircle, Mail, MapPin, Phone, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TurnstileField from '../components/TurnstileField';
import { turnstileSiteKey } from '../lib/turnstileConfig';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageIntro from '../components/ui/PageIntro';
import SectionHeading from '../components/ui/SectionHeading';
import { siteContact, siteCtas } from '../data/siteChrome';
import StaticResponsiveImage from '../components/StaticResponsiveImage';

type ContactFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  projectName: string;
  shippingAddress: string;
  sampleStone: string;
  sampleFinish: string;
  sampleQuantity: string;
};

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

const projectTypes = [
  'Project enquiry',
  'Sample request',
  'Stone library support',
  'Product specification',
  'Installation coordination',
];

function createInitialFormState(projectType = 'Project enquiry', sampleStone = ''): ContactFormState {
  return {
    name: '',
    company: '',
    email: '',
    phone: '',
    projectType,
    message: '',
    projectName: '',
    shippingAddress: '',
    sampleStone,
    sampleFinish: '',
    sampleQuantity: '1',
  };
}

function FieldLabel({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-meta font-semibold uppercase tracking-caps text-muted">
      {children}
    </label>
  );
}

const inputClassName =
  'w-full rounded border border-black/15 bg-white px-4 py-3 text-copy font-medium text-ink transition placeholder:text-muted focus:border-ink';

const channelLabelClassName = 'block text-meta font-semibold uppercase tracking-caps text-muted';
const channelValueClassName = 'mt-1 block text-lead font-semibold text-ink';

export default function ContactPage() {
  const settings = usePublicSiteSettings();
  const [searchParams] = useSearchParams();
  const queryProjectType =
    searchParams.get('intent') === 'sample-request' ? 'Sample request' : 'Project enquiry';
  const querySampleStone = searchParams.get('stone') || '';
  const [form, setForm] = useState<ContactFormState>(() =>
    createInitialFormState(queryProjectType, querySampleStone),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState('');
  const isSampleRequest = form.projectType === 'Sample request';
  const isTurnstileEnabled = Boolean(turnstileSiteKey);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      projectType: queryProjectType,
      sampleStone: querySampleStone || current.sampleStone,
    }));
    setFormError(null);
    setSuccessMessage(null);
    setSubmissionStatus('idle');
    setTurnstileError(null);
    setTurnstileToken('');
    setTurnstileResetSignal((current) => current + 1);
  }, [queryProjectType, querySampleStone]);

  function updateField(field: keyof ContactFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError(null);
    setSuccessMessage(null);
    if (submissionStatus !== 'submitting') {
      setSubmissionStatus('idle');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hasCoreFields = Boolean(form.name.trim() && form.email.trim());
    const hasProjectNotes = Boolean(form.message.trim());
    const hasSampleFields = Boolean(form.sampleStone.trim() && form.shippingAddress.trim());

    if (!hasCoreFields || (!isSampleRequest && !hasProjectNotes)) {
      setFormError(
        'Add your name, email, and project notes before sending the enquiry.',
      );
      setSubmissionStatus('error');
      return;
    }

    if (isSampleRequest && !hasSampleFields) {
      setFormError('Add the sample preference and shipping address before sending the request.');
      setSubmissionStatus('error');
      return;
    }

    if (isTurnstileEnabled && !turnstileToken) {
      const message = turnstileError || 'Complete the verification check before sending the request.';
      setFormError(message);
      setSubmissionStatus('error');
      return;
    }

    const endpoint = isSampleRequest ? '/api/sample-requests' : '/api/enquiries';
    const sourceRoute = `${window.location.pathname}${window.location.search}`;

    setSubmissionStatus('submitting');
    setFormError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          sourceRoute,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok || !body?.ok) {
        const serverMessage =
          body?.error?.message ||
          'The request could not be submitted. Please contact Urblo directly.';
        throw new Error(serverMessage);
      }

      setSubmissionStatus('success');
      setSuccessMessage(
        isSampleRequest
          ? 'Sample request received. Urblo will confirm availability and next steps.'
          : 'Project enquiry received. Urblo will review the brief and respond with practical next steps.',
      );
      setForm(createInitialFormState(form.projectType));
      setTurnstileToken('');
      setTurnstileResetSignal((current) => current + 1);
    } catch (error) {
      setSubmissionStatus('error');
      setFormError(error instanceof Error ? error.message : 'The request could not be submitted.');
      setTurnstileToken('');
      setTurnstileResetSignal((current) => current + 1);
    }
  }

  return (
    <div className="bg-white">
      <PageIntro
        band
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        title="Start a project conversation"
        lede="Share the project stage, stone intent, or sample need. We will help translate the brief into practical next steps for design, specification, sourcing, and delivery."
      />

      <section className="urblo-section bg-surface">
        <div className="urblo-page-container grid gap-6 lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <aside className="space-y-6">
            <Card surface="dark">
              <div className="relative min-h-[360px]">
                <StaticResponsiveImage
                  src="/media/launch/contact/project-contact.jpg"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  alt="Urblo stone seating project"
                  className="absolute inset-0 h-full w-full object-cover opacity-72"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                <SectionHeading
                  surface="dark"
                  eyebrow="We build. You design."
                  title="Design-led stone support, from sketch to install."
                  className="absolute inset-x-0 bottom-0 p-6"
                />
              </div>
            </Card>

            <Card className="divide-y divide-line">
              <a
                href="mailto:info@urblo.com.au?subject=Contact%20Us"
                className="urblo-focus-inset flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-surface"
              >
                <span className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-ink" aria-hidden="true" />
                  <span>
                    <span className={channelLabelClassName}>Email</span>
                    <span className={channelValueClassName}>{siteContact.email}</span>
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted" aria-hidden="true" />
              </a>

              <a
                href="tel:1300187256"
                aria-label={`Phone ${siteContact.phoneDisplay} (${siteContact.phoneDigits})`}
                className="urblo-focus-inset flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-surface"
              >
                <span className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-ink" aria-hidden="true" />
                  <span>
                    <span className={channelLabelClassName}>Phone</span>
                    <span className={channelValueClassName}>{siteContact.phoneDisplay}</span>
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted" aria-hidden="true" />
              </a>

              {(['office', 'warehouse'] as const).map(key => (
                <div key={key} className="flex items-start gap-4 px-5 py-5">
                  <MapPin className="mt-1 h-5 w-5 flex-none text-ink" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className={channelLabelClassName}>{companyLocationLabels[key]}</p>
                    <p className={`${channelValueClassName} break-words`}>{settings.locations[key]}</p>
                  </div>
                </div>
              ))}
            </Card>
          </aside>

          <Card className="p-6 md:p-8">
            <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-start md:justify-between">
              <SectionHeading eyebrow="Project brief" title="Send a project brief" />
              <Button
                variant="ghost"
                to={siteCtas.stoneLibrary.to}
                className="shrink-0 self-start whitespace-nowrap"
              >
                {siteCtas.stoneLibrary.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                  <input
                    id="contact-name"
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className={inputClassName}
                    autoComplete="name"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="contact-company">Company</FieldLabel>
                  <input
                    id="contact-company"
                    value={form.company}
                    onChange={(event) => updateField('company', event.target.value)}
                    className={inputClassName}
                    autoComplete="organization"
                    placeholder="Studio, council, builder"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className={inputClassName}
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="contact-phone">Phone</FieldLabel>
                  <input
                    id="contact-phone"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    className={inputClassName}
                    autoComplete="tel"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="contact-project-type">Enquiry type</FieldLabel>
                <select
                  id="contact-project-type"
                  value={form.projectType}
                  onChange={(event) => updateField('projectType', event.target.value)}
                  className={inputClassName}
                >
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {isSampleRequest ? (
                <div className="grid gap-5 rounded border border-line bg-surface p-4 md:grid-cols-2 md:p-5">
                  <div>
                    <FieldLabel htmlFor="contact-sample-stone">Stone or sample preference</FieldLabel>
                    <input
                      id="contact-sample-stone"
                      value={form.sampleStone}
                      onChange={(event) => updateField('sampleStone', event.target.value)}
                      className={inputClassName}
                      placeholder="Angola Black, sawn bluestone, finish set"
                      required={isSampleRequest}
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="contact-sample-finish">Finish preference</FieldLabel>
                    <input
                      id="contact-sample-finish"
                      value={form.sampleFinish}
                      onChange={(event) => updateField('sampleFinish', event.target.value)}
                      className={inputClassName}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="contact-sample-quantity">Quantity</FieldLabel>
                    <input
                      id="contact-sample-quantity"
                      type="number"
                      min="1"
                      max="20"
                      value={form.sampleQuantity}
                      onChange={(event) => updateField('sampleQuantity', event.target.value)}
                      className={inputClassName}
                      required={isSampleRequest}
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="contact-project-name">Project name</FieldLabel>
                    <input
                      id="contact-project-name"
                      value={form.projectName}
                      onChange={(event) => updateField('projectName', event.target.value)}
                      className={inputClassName}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="contact-shipping-address">Shipping address</FieldLabel>
                    <textarea
                      id="contact-shipping-address"
                      value={form.shippingAddress}
                      onChange={(event) => updateField('shippingAddress', event.target.value)}
                      className={`${inputClassName} min-h-[110px] resize-y`}
                      placeholder="Address for sample delivery"
                      required={isSampleRequest}
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <FieldLabel htmlFor="contact-message">
                  {isSampleRequest ? 'Additional notes' : 'Project notes'}
                </FieldLabel>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  className={`${inputClassName} min-h-[170px] resize-y`}
                  placeholder="Tell us about location, project stage, stone intent, finish preference, timing, or sample needs."
                  aria-describedby={formError ? 'contact-form-error' : undefined}
                  required={!isSampleRequest}
                />
              </div>

              <TurnstileField
                resetSignal={turnstileResetSignal}
                siteKey={turnstileSiteKey}
                onError={setTurnstileError}
                onToken={setTurnstileToken}
              />

              {successMessage ? (
                <p
                  role="status"
                  className="flex items-start gap-3 rounded border border-lime/40 bg-lime/[0.12] px-4 py-3 text-small font-semibold text-ink"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
                  {successMessage}
                </p>
              ) : null}

              {formError ? (
                <p
                  id="contact-form-error"
                  role="alert"
                  className="rounded border border-line bg-lime/[0.14] px-4 py-3 text-small font-semibold text-ink"
                >
                  {formError}
                </p>
              ) : null}

              <div className="flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
                <p className="max-w-[30rem] text-small text-muted">
                  This stores the brief securely for Urblo. Direct email and phone remain available
                  if you prefer to speak first.
                </p>
                <Button
                  type="submit"
                  className="shrink-0 whitespace-nowrap"
                  disabled={submissionStatus === 'submitting'}
                >
                  {submissionStatus === 'submitting'
                    ? 'Sending...'
                    : isSampleRequest
                      ? siteCtas.sampleRequest.label
                      : 'Send enquiry'}
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}

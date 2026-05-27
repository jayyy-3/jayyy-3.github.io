import { ArrowUpRight, CheckCircle, Mail, MapPin, Phone, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

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
    <label htmlFor={htmlFor} className="urblo-meta mb-2 block text-black/62">
      {children}
    </label>
  );
}

const inputClassName =
  'w-full rounded-[4px] border border-black/15 bg-white px-4 py-3 text-[15px] font-medium text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-[var(--urblo-lime)]';

export default function ContactPage() {
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
  const isSampleRequest = form.projectType === 'Sample request';

  useEffect(() => {
    setForm((current) => ({
      ...current,
      projectType: queryProjectType,
      sampleStone: querySampleStone || current.sampleStone,
    }));
    setFormError(null);
    setSuccessMessage(null);
    setSubmissionStatus('idle');
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
    } catch (error) {
      setSubmissionStatus('error');
      setFormError(error instanceof Error ? error.message : 'The request could not be submitted.');
    }
  }

  return (
    <div className="bg-white">
      <section className="urblo-section-tight border-b border-black/10">
        <div className="urblo-page-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="urblo-eyebrow">Contact Urblo</p>
            <h1 className="urblo-page-title">Start a project conversation</h1>
          </div>
          <p className="max-w-[44rem] text-[20px] font-medium leading-8 text-[var(--urblo-text)]">
            Share the project stage, stone intent, or sample need. We will help translate the brief
            into practical next steps for design, specification, sourcing, and delivery.
          </p>
        </div>
      </section>

      <section className="urblo-section bg-[rgba(239,239,239,0.22)]">
        <div className="urblo-page-container grid gap-6 lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <aside className="space-y-6">
            <div className="urblo-card overflow-hidden border-black/10 bg-black text-white shadow-none">
              <div className="relative min-h-[360px]">
                <img
                  src="/media/launch/contact/project-contact.jpg"
                  alt="Urblo stone seating project"
                  className="absolute inset-0 h-full w-full object-cover opacity-72"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="urblo-meta text-white/62">WE BUILD. YOU DESIGN.</p>
                  <h2 className="mt-4 font-display text-[30px] font-semibold uppercase leading-[1.08] tracking-[0.03em] text-white md:text-[38px]">
                    Design-led stone support, from sketch to install.
                  </h2>
                </div>
              </div>
            </div>

            <div className="urblo-card divide-y divide-black/10 overflow-hidden bg-white shadow-none">
              <a
                href="mailto:info@urblo.com.au?subject=Contact%20Us"
                className="flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-[rgba(239,239,239,0.45)]"
              >
                <span className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-black" aria-hidden="true" />
                  <span>
                    <span className="block text-[13px] font-semibold uppercase tracking-[0.12em] text-black/52">
                      Email
                    </span>
                    <span className="mt-1 block text-[18px] font-semibold text-black">
                      info@urblo.com.au
                    </span>
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 text-black/45" aria-hidden="true" />
              </a>

              <a
                href="tel:1300187256"
                className="flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-[rgba(239,239,239,0.45)]"
              >
                <span className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-black" aria-hidden="true" />
                  <span>
                    <span className="block text-[13px] font-semibold uppercase tracking-[0.12em] text-black/52">
                      Phone
                    </span>
                    <span className="mt-1 block text-[18px] font-semibold text-black">
                      1300 1URBLO
                    </span>
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 text-black/45" aria-hidden="true" />
              </a>

              <div className="flex items-start gap-4 px-5 py-5">
                <MapPin className="mt-1 h-5 w-5 flex-none text-black" aria-hidden="true" />
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-black/52">
                    Studio
                  </p>
                  <p className="mt-1 text-[18px] font-semibold leading-7 text-black">
                    5 Hamilton St,
                    <br />
                    Oakleigh VIC 3166
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="urblo-card bg-white p-6 shadow-none md:p-8">
            <div className="flex flex-col gap-4 border-b border-black/10 pb-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="urblo-eyebrow">Project brief</p>
                <h2 className="mt-4 font-display text-[32px] font-semibold uppercase leading-[1.08] tracking-[0.03em] text-black md:text-[44px]">
                  Send a project brief
                </h2>
              </div>
              <Link to="/stone-library" className="urblo-button self-start">
                Stone Library
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
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
                <div className="grid gap-5 rounded-[4px] border border-black/10 bg-[rgba(239,239,239,0.28)] p-4 md:grid-cols-2 md:p-5">
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
                      className={`${inputClassName} min-h-[110px] resize-y leading-7`}
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
                  className={`${inputClassName} min-h-[170px] resize-y leading-7`}
                  placeholder="Tell us about location, project stage, stone intent, finish preference, timing, or sample needs."
                  aria-describedby={formError ? 'contact-form-error' : undefined}
                  required={!isSampleRequest}
                />
              </div>

              {successMessage ? (
                <p
                  role="status"
                  className="flex items-start gap-3 rounded-[4px] border border-[var(--urblo-lime)]/40 bg-[rgba(0,255,25,0.12)] px-4 py-3 text-[14px] font-semibold leading-6 text-black"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
                  {successMessage}
                </p>
              ) : null}

              {formError ? (
                <p
                  id="contact-form-error"
                  role="alert"
                  className="rounded-[4px] border border-black/10 bg-[rgba(0,255,25,0.14)] px-4 py-3 text-[14px] font-semibold leading-6 text-black"
                >
                  {formError}
                </p>
              ) : null}

              <div className="flex flex-col gap-4 border-t border-black/10 pt-6 md:flex-row md:items-center md:justify-between">
                <p className="max-w-[30rem] text-[14px] leading-6 text-black/58">
                  This stores the brief securely for Urblo. Direct email and phone remain available
                  if you prefer to speak first.
                </p>
                <button
                  type="submit"
                  className="urblo-button-inverse disabled:cursor-wait disabled:opacity-60"
                  disabled={submissionStatus === 'submitting'}
                >
                  {submissionStatus === 'submitting'
                    ? 'Sending...'
                    : isSampleRequest
                      ? 'Request samples'
                      : 'Send enquiry'}
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

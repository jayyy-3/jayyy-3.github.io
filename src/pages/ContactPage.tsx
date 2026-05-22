import { ArrowUpRight, Mail, MapPin, Phone, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type ContactFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  projectType: 'Project enquiry',
  message: '',
};

const projectTypes = [
  'Project enquiry',
  'Sample request',
  'Stone library support',
  'Product specification',
  'Installation coordination',
];

function buildMailto(form: ContactFormState): string {
  const subject = encodeURIComponent(`Urblo ${form.projectType}`);
  const body = encodeURIComponent(
    [
      'Hi Urblo,',
      '',
      'I would like to discuss a streetscape or civil landscape project.',
      '',
      `Name: ${form.name || '-'}`,
      `Company: ${form.company || '-'}`,
      `Email: ${form.email || '-'}`,
      `Phone: ${form.phone || '-'}`,
      `Enquiry type: ${form.projectType}`,
      '',
      'Project notes:',
      form.message || '-',
    ].join('\n'),
  );

  return `mailto:info@urblo.com.au?subject=${subject}&body=${body}`;
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
  const [form, setForm] = useState<ContactFormState>(initialFormState);

  function updateField(field: keyof ContactFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = buildMailto(form);
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
                  Open an email draft
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

              <div>
                <FieldLabel htmlFor="contact-message">Project notes</FieldLabel>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  className={`${inputClassName} min-h-[170px] resize-y leading-7`}
                  placeholder="Tell us about location, project stage, stone intent, finish preference, timing, or sample needs."
                />
              </div>

              <div className="flex flex-col gap-4 border-t border-black/10 pt-6 md:flex-row md:items-center md:justify-between">
                <p className="max-w-[30rem] text-[14px] leading-6 text-black/58">
                  This prepares a message in your email app so the brief can be sent directly to Urblo.
                </p>
                <button type="submit" className="urblo-button-inverse">
                  Open email draft
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

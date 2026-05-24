import { Link } from 'react-router-dom';

interface RouteStateAction {
  label: string;
  to: string;
  variant?: 'primary' | 'secondary';
}

interface RouteStateProps {
  eyebrow: string;
  title: string;
  copy: string;
  actions?: RouteStateAction[];
}

export default function RouteState({
  eyebrow,
  title,
  copy,
  actions = [],
}: RouteStateProps) {
  return (
    <section className="min-h-[56vh] border-b border-black/10 bg-white py-16 md:py-24">
      <div className="urblo-page-container">
        <div className="max-w-[56rem]">
          <p className="urblo-eyebrow">{eyebrow}</p>
          <h1 className="urblo-page-title">{title}</h1>
          <p className="urblo-page-copy">{copy}</p>

          {actions.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={
                    action.variant === 'secondary'
                      ? 'urblo-button'
                      : 'urblo-button-inverse'
                  }
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

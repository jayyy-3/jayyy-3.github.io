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
  headerOffset?: boolean;
}

export default function RouteState({
  eyebrow,
  title,
  copy,
  actions = [],
  headerOffset = false,
}: RouteStateProps) {
  return (
    <section
      className={[
        'min-h-[56vh] border-b border-black/10 bg-white pb-16 md:pb-24',
        headerOffset ? 'pt-[166px] md:pt-[198px]' : 'pt-16 md:pt-24',
      ].join(' ')}
    >
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

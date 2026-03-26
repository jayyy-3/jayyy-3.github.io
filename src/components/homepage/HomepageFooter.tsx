import { homepageData, homepageNavLinks, homepageSocialLinks } from '../../data/homepage';

const footerMenu = homepageNavLinks.filter(
  (item) => item.label === 'Sample Request' || item.label === 'Contact Us',
);

export default function HomepageFooter() {
  return (
    <footer className="bg-black px-6 py-16 text-white md:px-10 lg:px-[95px]">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.4fr_0.8fr_0.7fr]">
        <div className="space-y-6">
          <h2 className="max-w-[34rem] text-[26px] font-semibold uppercase leading-[1.55] tracking-[0.06em] md:text-[28px]">
            {homepageData.brandStatement.slice(0, -1)}
            <span className="text-[var(--urblo-lime)]">.</span>
          </h2>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-[17px] text-white/70">
            <span>Facebook</span>
            {homepageSocialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-[var(--urblo-lime)]"
                target="_blank"
                rel="noreferrer"
              >
                {item.label}
              </a>
            ))}
            <span>YouTube</span>
          </div>
        </div>

        <div className="space-y-4 text-[18px] leading-[1.9] text-white/85">
          <p>{homepageData.footer.address[0]}</p>
          <p>{homepageData.footer.address[1]}</p>
          <p>
            <a
              href={`mailto:${homepageData.footer.email}`}
              className="underline decoration-white/40 underline-offset-4"
            >
              {homepageData.footer.email}
            </a>
          </p>
          <p className="font-semibold text-white">{homepageData.footer.phone}</p>
        </div>

        <div className="space-y-4 text-[18px] leading-[1.9] text-white/85">
          {footerMenu.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block transition-colors hover:text-[var(--urblo-lime)]"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 text-[16px] text-white/55">
            <p>All rights reserved</p>
            <p>{homepageData.footer.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

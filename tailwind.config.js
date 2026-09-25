/** @type {import('tailwindcss').Config} */
const percentageOpacity = Object.fromEntries(
  Array.from({ length: 101 }, (_, value) => [String(value), String(value / 100)]),
)

// Urblo design tokens. docs/DESIGN.md "Visual System → Tokens" is the reference table; keep both in step.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand and text tones on light surfaces: strong (ink), body, muted.
        ink: '#000000',
        body: '#33363F',
        muted: '#63666D',
        // Signal only: active states, key proof, small labels, decisive CTAs.
        lime: '#00FF19',
        // Text tones on dark surfaces and photography.
        inverse: {
          DEFAULT: '#FFFFFF',
          body: 'rgba(255, 255, 255, 0.72)',
          muted: 'rgba(255, 255, 255, 0.56)',
        },
        // Border tones: hairline on light surfaces, hairline on dark surfaces.
        line: {
          DEFAULT: 'rgba(0, 0, 0, 0.12)',
          inverse: 'rgba(255, 255, 255, 0.14)',
        },
        surface: 'rgba(239, 239, 239, 0.28)',
      },
      fontSize: {
        meta: ['12px', { lineHeight: '1.5' }],
        small: ['14px', { lineHeight: '1.6' }],
        copy: ['16px', { lineHeight: '1.75' }],
        lead: ['20px', { lineHeight: '1.6' }],
        'title-sm': ['24px', { lineHeight: '1.2' }],
        title: ['34px', { lineHeight: '1.15' }],
        'title-lg': ['44px', { lineHeight: '1.1' }],
        display: ['64px', { lineHeight: '1.1' }],
        hero: ['104px', { lineHeight: '1' }],
        'hero-lg': ['140px', { lineHeight: '1' }],
      },
      letterSpacing: {
        caps: '0.12em',
        eyebrow: '0.18em',
      },
      spacing: {
        gutter: 'var(--urblo-gutter)',
        section: 'var(--urblo-section)',
        'section-tight': 'var(--urblo-section-tight)',
      },
      opacity: percentageOpacity,
    },
  },
  plugins: [require("@tailwindcss/typography")],
}

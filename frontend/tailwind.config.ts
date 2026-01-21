import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ══════════════════════════════════════════════════════════════════
      //  VIDA DESIGN TOKENS - Style Monochrome Professionnel
      // ══════════════════════════════════════════════════════════════════

      // Couleurs VIDA (teal comme unique accent)
      colors: {
        'vida-teal': 'hsl(var(--vida-teal))',
        'vida-teal-light': 'hsl(var(--vida-teal-light))',
        'vida-teal-dark': 'hsl(var(--vida-teal-dark))',
        'vida-teal-ultra-dark': 'hsl(var(--vida-teal-ultra-dark))',
        'text-primary': 'hsl(var(--vida-text-primary))',
        'text-secondary': 'hsl(var(--vida-text-secondary))',
        'text-tertiary': 'hsl(var(--vida-text-tertiary))',
        'bg-primary': 'hsl(var(--vida-bg-primary))',
        'bg-secondary': 'hsl(var(--vida-bg-secondary))',
        'bg-tertiary': 'hsl(var(--vida-bg-tertiary))',
        success: 'hsl(var(--vida-success))',
        'success-light': 'hsl(var(--vida-success-light))',
        error: 'hsl(var(--vida-error))',
        'error-light': 'hsl(var(--vida-error-light))',
        warning: 'hsl(var(--vida-warning))',
        'warning-light': 'hsl(var(--vida-warning-light))',
        info: 'hsl(var(--vida-info))',
        'info-light': 'hsl(var(--vida-info-light))',
      },

      // Border Radius VIDA
      borderRadius: {
        'vida-sm': 'var(--vida-radius-sm)',
        'vida-md': 'var(--vida-radius-md)',
        'vida-lg': 'var(--vida-radius-lg)',
      },

      // Box Shadows VIDA
      boxShadow: {
        'vida-1': 'var(--vida-shadow-1)',
        'vida-2': 'var(--vida-shadow-2)',
        'vida-3': 'var(--vida-shadow-3)',
        'vida-4': 'var(--vida-shadow-4)',
        'vida-5': 'var(--vida-shadow-5)',
      },

      // Typographie VIDA - Inter + IBM Plex Mono
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'Consolas', 'Monaco', 'Andale Mono', 'monospace'],
      },

      // Font Weights
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      // Letter Spacing
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.025em',
      },

      // Font Sizes avec clamp() pour responsive
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['clamp(0.9375rem, 1.8vw, 1rem)', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['clamp(1.25rem, 3vw, 1.5rem)', { lineHeight: '1.3' }],
        '3xl': ['clamp(1.5rem, 4vw, 1.875rem)', { lineHeight: '1.25' }],
        '4xl': ['clamp(1.75rem, 4.5vw, 2.25rem)', { lineHeight: '1.2' }],
        '5xl': ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.15' }],
        '6xl': ['clamp(2.5rem, 6vw, 3.75rem)', { lineHeight: '1.1' }],
      },

      // Transitions VIDA
      transitionDuration: {
        'vida-fast': 'var(--vida-transition-fast)',
        'vida-base': 'var(--vida-transition-base)',
        'vida-slow': 'var(--vida-transition-slow)',
      },

      // ══════════════════════════════════════════════════════════════════
      //  EFFETS 3D SUBTILS - Extensions Tailwind
      // ══════════════════════════════════════════════════════════════════

      // Perspective 3D
      perspective: {
        'vida': 'var(--vida-perspective)',
        'vida-light': 'var(--vida-perspective-light)',
        'vida-strong': 'var(--vida-perspective-strong)',
      },

      // Transform Origin
      transformOrigin: {
        'vida-center': 'center center',
      },

      // Rotate 3D
      rotate: {
        'vida-subtle': 'var(--vida-rotate-subtle)',
        'vida-moderate': 'var(--vida-rotate-moderate)',
        'vida-strong': 'var(--vida-rotate-strong)',
      },

      // TranslateZ (Depth)
      translate: {
        'vida-depth-sm': 'var(--vida-depth-sm)',
        'vida-depth-md': 'var(--vida-depth-md)',
        'vida-depth-lg': 'var(--vida-depth-lg)',
      },

      // Transform Style
      transformStyle: {
        '3d': 'preserve-3d',
      },

      // Backface Visibility
      backfaceVisibility: {
        'hidden': 'hidden',
        'visible': 'visible',
      },
    },
  },
  plugins: [],
};

export default config;

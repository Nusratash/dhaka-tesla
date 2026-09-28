import type { Config } from 'tailwindcss';

// DaisyUI on top of Tailwind (brief: "can also use daisyUI"). A small
// custom "tesla" theme so status badges/brand colors read as intentional,
// not default-daisyUI-boilerplate.
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f766e',
          dark: '#0b5a54',
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        tesla: {
          primary: '#0f766e',
          secondary: '#f59e0b',
          accent: '#7c3aed',
          neutral: '#1f2937',
          'base-100': '#ffffff',
          info: '#0ea5e9',
          success: '#16a34a',
          warning: '#f59e0b',
          error: '#dc2626',
        },
      },
    ],
  },
};
export default config;

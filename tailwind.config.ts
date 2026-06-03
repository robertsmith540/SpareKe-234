import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#050816',
        carbon: '#101828',
        obsidian: '#05070f',
        midnight: '#07111f',
        imperial: '#101a33',
        platinum: '#edf2f7',
        champagne: '#f7e7b2',
        gold: '#d6b35a',
        'gold-soft': '#f2d88f',
        emerald: '#23d18b',
        copper: '#f97316',
        road: '#1f2937',
        volt: '#8df43f'
      },
      fontFamily: {
        display: ['Inter', 'Aptos Display', 'Segoe UI', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Aptos', 'Segoe UI', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 50px rgba(214, 179, 90, 0.18)',
        luxe: '0 24px 80px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        gold: '0 0 46px rgba(214, 179, 90, 0.24)'
      },
      backgroundImage: {
        'gold-sheen': 'linear-gradient(135deg, #f7e7b2 0%, #d6b35a 45%, #9f7c2f 100%)',
        'luxe-panel': 'linear-gradient(145deg, rgba(255,255,255,0.105), rgba(255,255,255,0.028))'
      }
    }
  },
  plugins: []
};

export default config;

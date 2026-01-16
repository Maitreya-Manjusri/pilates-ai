/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Organic Biophilic Typography
      fontFamily: {
        'heading': ['Lora', 'Georgia', 'serif'],
        'body': ['Raleway', 'system-ui', 'sans-serif'],
      },
      // Organic Biophilic Color Palette
      colors: {
        // Primary - Forest Green
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#228B22',
          600: '#1e7b1e',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        // Secondary - Earth Brown
        earth: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#8B4513',
          600: '#7a3d11',
          700: '#5c2d0e',
          800: '#44210a',
          900: '#2d1606',
        },
        // Accent - Sky Blue
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#87CEEB',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Neutral - Beige/Sand
        sand: {
          50: '#FDFBF7',
          100: '#F5F5DC',
          200: '#ede9d5',
          300: '#e0d9c3',
          400: '#d1c7ab',
          500: '#c2b593',
          600: '#a89a75',
          700: '#8a7d5c',
          800: '#6b6047',
          900: '#4d4433',
        },
      },
      // Organic rounded corners
      borderRadius: {
        'organic': '1.5rem',
        'organic-lg': '2rem',
        'organic-xl': '2.5rem',
      },
      // Natural shadows
      boxShadow: {
        'organic': '0 4px 20px -2px rgba(34, 139, 34, 0.1), 0 2px 8px -2px rgba(34, 139, 34, 0.06)',
        'organic-lg': '0 10px 40px -4px rgba(34, 139, 34, 0.15), 0 4px 16px -4px rgba(34, 139, 34, 0.1)',
        'organic-hover': '0 14px 50px -6px rgba(34, 139, 34, 0.2), 0 6px 20px -6px rgba(34, 139, 34, 0.12)',
      },
    },
  },
  plugins: [],
  // 保留所有可能用到的主題色，避免被 PurgeCSS 清除
  safelist: [
    {
      pattern: /(bg|text|border|ring|from|to|shadow)-(stone|slate|rose|teal|indigo|emerald|amber|purple|blue|cyan|forest|earth|sky|sand)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus', 'group-hover'],
    },
    // 確保 forest 主題色完整保留
    'bg-forest-500', 'bg-forest-600', 'bg-forest-700',
    'text-forest-500', 'text-forest-600', 'text-forest-700', 'text-forest-800',
    'border-forest-500', 'border-forest-600',
    'from-forest-500', 'from-forest-600', 'to-forest-600', 'to-forest-700',
    'ring-forest-300', 'ring-forest-100',
    'hover:bg-forest-600', 'hover:bg-forest-700',
    'hover:from-forest-600', 'hover:to-forest-700',
    // earth 主題色
    'bg-earth-500', 'bg-earth-600', 'bg-earth-700',
    'text-earth-400', 'text-earth-500', 'text-earth-600', 'text-earth-700', 'text-earth-800', 'text-earth-900',
    'border-earth-500',
    // sand 背景色
    'bg-sand-50', 'bg-sand-100', 'bg-sand-200',
    'border-sand-200', 'border-sand-300',
    'text-sand-500',
  ],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // 關鍵設定：保留所有可能用到的主題色，避免被 PurgeCSS 清除
  safelist: [
    {
      pattern: /(bg|text|border|ring)-(stone|slate|rose|teal|indigo|emerald|amber|purple|blue|cyan)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus', 'group-hover'],
    },
  ],
}

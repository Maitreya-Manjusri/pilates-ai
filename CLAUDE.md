# CLAUDE.md - Project Instructions for Claude Code

## Project Overview
Pilates AI Lesson Planner - 皮拉提斯智能排課系統

A React-based web application for Pilates instructors to manage exercise databases, auto-generate lesson plans, and track teaching hours.

## Tech Stack
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** GitHub Pages

## Project Structure
```
pilates-ai/
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # React entry point
│   ├── index.css            # Tailwind imports & custom styles
│   └── data/
│       ├── exerciseDb.js    # Database loader & transformer
│       ├── 核心床動作資料庫.json   # Reformer exercises
│       ├── 鞦韆床動作資料庫.json   # Cadillac exercises
│       ├── 椅子動作資料庫.json     # Chair exercises
│       ├── 梯筒動作資料庫.json     # Barrel exercises
│       └── ARC 動作資料庫.json    # ARC exercises
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .github/workflows/deploy.yml
```

## Key Commands
```bash
npm install    # Install dependencies
npm run dev    # Start dev server (localhost:5173)
npm run build  # Build for production
```

## Database Schema
Each exercise in JSON follows this structure:
```json
{
  "編號": "REF-L1-001",
  "動作名稱": "Footwork 步法",
  "難度分級": "初階",
  "器材設定": { ... },
  "建議次數": "10次",
  "課程分類": "正式訓練",
  "學員特性過濾": { ... },
  "安全要點": [...],
  "教學口令": { "起始位置": "...", "動作引導": "..." },
  "意象提示": "...",
  "訓練目標": "...",
  "動作變化": [...]
}
```

## Data Transformation
`exerciseDb.js` transforms Chinese JSON to app format:
- `難度分級` → `level` (Beginner/Intermediate/Advanced)
- `器材設定.器材種類` → `category` (Reformer/Cadillac/Chair/Barrel/ARC)
- `課程分類` → `type` (Active/CoolDown)
- `學員特性過濾` → `contraindications` array

## Features
1. **Home** - Studio selection, student management
2. **Auto Planner** - AI-based random exercise selection with filters
3. **Library** - Browse exercises, manual cart-based scheduling
4. **Calendar** - Week/month view for scheduled lessons
5. **Settings** - Theme colors (5 options), teaching hours tracker

## Coding Guidelines
- Use Traditional Chinese (繁體中文) for UI text
- Follow existing component patterns in App.jsx
- Tailwind classes with dynamic theme colors use safelist in config
- Keep exercise detail modal consistent across views

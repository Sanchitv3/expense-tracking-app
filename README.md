# AI Expense Tracker

A full-stack expense tracking app that uses AI (Groq/Llama) to parse natural language input into structured expenses.

## 🎥 Demo

https://github.com/user-attachments/assets/expense-tracker-demo

> **Watch the demo:** [demo.mov](./demo.mov)

## Tech Stack

- **Mobile:** React Native, Expo, TypeScript, react-native-svg, expo-linear-gradient
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite (via better-sqlite3)
- **AI:** Groq API (Llama 3.1 8B Instant)

## Features

- AI-powered natural language expense parsing
- Total spends dashboard with category breakdown
- Date range filtering with calendar picker
- Pull-to-refresh expense list
- Delete with confirmation
- Animated success feedback
- Production-grade UI with gradients, SVG icons, and shadows

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Express server entry
│   │   ├── database/index.ts        # SQLite setup & CRUD
│   │   ├── routes/expenses.ts       # API endpoints
│   │   └── services/ai.ts           # Groq AI integration
│   ├── .env                         # API key (add yours)
│   └── .env.example
│
├── mobile/
│   ├── App.tsx                      # Entry point
│   └── src/
│       ├── screens/
│       │   └── ExpenseTrackerScreen.tsx
│       ├── components/
│       │   ├── ExpenseInput.tsx      # Input field + send button
│       │   ├── ExpenseItem.tsx       # Expense list item
│       │   ├── SuccessCard.tsx       # Success feedback card
│       │   ├── SummaryCard.tsx       # Total spends + breakdown
│       │   ├── DateFilter.tsx        # Date range picker
│       │   └── Icons.tsx             # Custom SVG icons
│       ├── services/
│       │   ├── api.ts                # API client
│       │   └── helpers.ts            # Formatting utilities
│       └── types/
│           └── expense.ts            # TypeScript types
│
├── demo.mov                         # Demo video
└── README.md
```

## Quick Start

### 1. Get a Groq API Key (free)

Go to [console.groq.com](https://console.groq.com) and create an API key.

### 2. Start the Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=gsk_your_key_here
npm run dev
```

Server runs at `http://localhost:3001`

### 3. Start the Mobile App

```bash
cd mobile
npm install
npm start
```

Scan the QR code with Expo Go, or press `i`/`a` for simulator/emulator.

**Physical device:** Update `API_BASE_URL` in `mobile/src/services/api.ts` to your machine's local IP (e.g., `http://192.168.1.100:3001`).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/expenses` | Add expense (natural language) |
| GET | `/api/expenses` | List expenses (supports `?from=` & `?to=` date filter) |
| DELETE | `/api/expenses/:id` | Delete expense |

### Example: Add Expense

```bash
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"input": "Spent 850 on lunch at Taj Hotel"}'
```

### Example: Filter by Date Range

```bash
curl "http://localhost:3001/api/expenses?from=2026-01-01&to=2026-01-31"
```

Response includes `totalSpends`, `totalCount`, and category `breakdown`:

```json
{
  "success": true,
  "expenses": [...],
  "totalSpends": 850,
  "totalCount": 1,
  "breakdown": [
    { "category": "Food & Dining", "total": 850, "count": 1 }
  ]
}
```

## Categories

| Category | Emoji | Color |
|----------|-------|-------|
| Food & Dining | 🍔 | #FF6B6B |
| Transport | 🚗 | #4ECDC4 |
| Shopping | 🛒 | #A78BFA |
| Entertainment | 📺 | #F59E0B |
| Bills & Utilities | 📄 | #3B82F6 |
| Health | 💊 | #10B981 |
| Travel | ✈️ | #F472B6 |
| Other | 📦 | #6B7280 |

## License

MIT

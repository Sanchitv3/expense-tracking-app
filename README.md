# AI Expense Tracker

A full-stack expense tracking app that uses AI (Groq/Llama) to parse natural language input into structured expenses.

## Tech Stack

- **Mobile:** React Native, Expo, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite (via better-sqlite3)
- **AI:** Groq API (Llama 3.1 8B Instant)

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server entry
│   │   ├── database/index.ts     # SQLite setup & CRUD
│   │   ├── routes/expenses.ts    # API endpoints
│   │   └── services/ai.ts        # Groq AI integration
│   ├── .env                      # API key (add yours)
│   └── .env.example
│
└── mobile/
    ├── App.tsx                    # Entry point
    └── src/
        ├── screens/ExpenseTrackerScreen.tsx  # Main UI
        ├── services/api.ts                   # API client
        ├── types/expense.ts                  # Types
        └── utils/helpers.ts                  # Utilities
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
| GET | `/api/expenses` | List all expenses |
| DELETE | `/api/expenses/:id` | Delete expense |

### Example: Add Expense

```bash
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"input": "Spent 850 on lunch at Taj Hotel"}'
```

Response:
```json
{
  "success": true,
  "expense": {
    "id": 1,
    "amount": 850,
    "currency": "INR",
    "category": "Food & Dining",
    "description": "Lunch at Taj Hotel",
    "merchant": "Taj Hotel",
    "created_at": "2025-01-20T10:30:00Z"
  }
}
```

## Categories

| Category | Emoji |
|----------|-------|
| Food & Dining | 🍔 |
| Transport | 🚗 |
| Shopping | 🛒 |
| Entertainment | 📺 |
| Bills & Utilities | 📄 |
| Health | 💊 |
| Travel | ✈️ |
| Other | 📦 |

## License

MIT

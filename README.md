# KrishiMitra AI - Localized Agri-Support & P2P Rental Marketplace

**KrishiMitra AI** is a decentralized, mobile-first agricultural ecosystem designed to empower small and marginal farmers across India. It integrates a multi-category Peer-to-Peer (P2P) rental sharing marketplace (for farm machinery, tools, vehicles, and electronics) with dynamic crop health diagnostics and post-harvest price forecasting. 

The application is localized in **7 regional Indian languages** (Hindi, Marathi, Telugu, Tamil, Kannada, Odia, and English) to overcome literacy and language barriers in rural areas.

---

## 🌟 Key Features

### 1. Peer-to-Peer (P2P) Rental Marketplace
- Rent tractors, power tillers, drills, storage spaces, or diagnostic tools directly from neighboring farmers.
- Automated date conflict checking to prevent double-bookings.
- Integrated quote calculator supporting Hourly, Daily, and Weekly rental tiers.
- Built-in chat rooms between listing owners and renters, order transaction histories, simulated payments, and ratings/reviews.
- Users can view and delete their active listed items directly from their dashboard.

### 2. Multilingual AI Assistant (Gemini 1.5 Flash)
- Voice-compatible chatbot localized to translate queries and recommendations in Marathi, Hindi, Telugu, Tamil, Odia, Kannada, or English.
- Multimodal Crop Leaf Diagnostics: Farmers upload leaf photos to detect pests/diseases with real-time confidence scores.

### 3. Human-in-the-Loop Verification Pipeline
- AI leaf diagnoses with confidence scores below **70%** are flagged as unverified and automatically routed to the regional **Agent Review Queue**.
- Extension agricultural officers verify diagnoses on their agent desks to prevent crop losses from incorrect AI suggestions.

### 4. Deterministic Government Schemes Matcher
- Matches farmers with central and state-level government schemes based on category, state boundaries, landholding acreage, and crops.
- Strict constraint filtering keeps Maharashtra-only benefits hidden from Telangana farmers, grouping eligible offers into "Highly Recommended" (100% Match) and "Partially Eligible" categories.

### 5. Post-Harvest Spoilage Risk & Price Advisor
- Recommends whether farmers should sell crops immediately or store them in a nearby cold storage based on local humidity, storage condition, crop shelf-life, and live Mandi price trends.

---

## 🛠️ Technological Stack

- **Frontend**: Next.js 15 (App Router), React 19 Client/Server Components.
- **Database**: PostgreSQL (Neon Serverless) / SQLite accessed via **Prisma ORM**.
- **Localization**: **next-intl** routing engine for regional language routes (e.g. `/hi/dashboard`, `/mr/rentals`).
- **AI Engine**: Google Gemini 1.5 Flash REST API (Direct vision/text model queries).
- **Styling**: Tailwind CSS with custom olive, forest green, and warm cream palettes.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **NPM** (v10.x or higher)
- A **Google Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))
- A **PostgreSQL database connection string** (e.g., Neon or Supabase) or local database.

### 2. Clone and Install Dependencies
```bash
# Clone the repository
cd "Hackathon 31.7"

# Install all workspace dependencies
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
# Database Connection URL (Postgres or SQLite)
DATABASE_URL="postgresql://user:password@hostname:port/dbname?sslmode=require"

# Google Gemini API Key for chatbot and leaf diagnostics
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 4. Initialize Database & Run Seed
Sync database tables using Prisma ORM and seed the platform with government schemes and default local listings:
```bash
# Push schema definitions to your Postgres database
npx prisma db push

# Seed the database with pilot data (Maharashtra, Andhra Pradesh, Telangana etc.)
node prisma/seed.js
```

### 5. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to interact with the application.

---

## 📦 Compiling Production Build
To run a strict TypeScript check and compile an optimized production build:
```bash
npm run build
```

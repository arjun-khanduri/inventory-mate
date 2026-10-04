# Fridgeful
_**Application live at:** https://inventory-mate.arkh18cs.workers.dev/_

Fridgeful is a minimalist, high-performance inventory management tool designed to help you reduce food waste by keeping a clear view of your kitchen staples, tracking expiry dates, and generating personalized meal ideas from what you already own.  


## Features

- **Inventory Tracking:** Easily add, track, and manage items in your fridge.
- **Expiry Monitoring:** Visual cues for items nearing their expiration dates.
- **Smart Reminders:** Browser notifications for expiring food.
- **AI-Powered Recipes:** Generate meal ideas based on your current inventory using Groq's open-weight models, facilitated by a serverless Cloudflare Worker.
- **Save & Curate:** Save your favorite generated recipes for later.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **State Management:** Custom React hooks using `localStorage`
- **Backend/Proxy:** [Cloudflare Workers](https://workers.cloudflare.com)
- **AI API:** [Groq Cloud](https://console.groq.com)

## Architecture

Fridgeful uses a static-export approach for the frontend, optimized for deployment on platforms like Cloudflare Pages. The AI recipe generation is offloaded to a Cloudflare Worker, which acts as a secure proxy to the Groq API, keeping your API keys hidden from the client-side.

---

## Developer Contributing Guide

We welcome contributions! Please follow these guidelines to get started.

### Prerequisites
- Node.js (v20+)
- Wrangler CLI (`npm install -g wrangler`)
- Groq API Key

### Getting Started
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd inventory-mate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_RECIPE_API_URL=<your-worker-url>
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

### Working with the Cloudflare Worker
The worker code resides in `worker/worker.js`. 
- To deploy the worker: `npx wrangler deploy`
- To set your Groq API secret: `npx wrangler secret put GROQ_API_KEY`

### Contribution Workflow
1. **Create a branch:** `git checkout -b feature/your-feature-name`
2. **Make your changes.**
3. **Follow Style Guidelines:**
   - Use 4 spaces for indentation.
   - Do not use spaces inside curly braces for imports (e.g., `import {useState} from "react"`).
   - Maintain the established aesthetic using Framer Motion for transitions.
4. **Lint & Build:** Run `npm run lint` and `npm run build` to ensure no regressions before submitting a pull request.

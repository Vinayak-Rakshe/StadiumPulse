# StadiumPulse 🏟️
### GenAI-Powered Smart Stadium & Tournament Operations Platform (FIFA World Cup 2026)

StadiumPulse is a modern, accessible, and intelligent full-stack MERN application built to coordinate and enhance the stadium experience for **Fans, Organizers, Volunteers, and Venue Staff** during the FIFA World Cup 2026.

## Challenge Requirement Mapping

StadiumPulse is specifically designed to address the core requirements of Google's Prompt Wars Challenge 4:

*   **Navigation & Wayfinding** &rarr; **AI Navigation & Wayfinding Assistant (Fan Concierge)**: Integrates Express-calculated Dijkstra shortest paths into Gemini natural language prompts, producing step-by-step descriptive guidance.
*   **Multilingual Assistance** &rarr; **Auto-Detected Real-Time Chat Translation**: Auto-detects user input language (English, Spanish, French, Arabic) in the concierge and translates responses dynamically.
*   **Accessibility** &rarr; **Step-Free Accessibility Router & Full WCAG AA Compliant UI**: Allows users to restrict paths to step-free zones (ramps/elevators) and operates with strict keyboard navigation support and custom high-visibility focus states.
*   **Crowd Management & Real-Time Decision Support** &rarr; **Dynamic Zone Density Tracking**: Tracks live occupancies against zone capacities, providing real-time density calculations to avoid bottlenecks.
*   **Operational Intelligence** &rarr; **AI Operations Bulletin & Volunteer Copilot**: Uses Gemini to analyze congestion data and protocol databases, synthesizing actionable operational summaries and safety checklists for staff/volunteers.
*   **Sustainability** &rarr; **AI-Powered Green Insights Panel**: Generates sustainability logs analysis (water, energy, recycling rate) to provide real-time green optimization feedback.

> ℹ️ **Render Backend Cold-Start Note**: The backend API is hosted on Render's free tier. If the application has been inactive, the web service will spin down. The first API request (e.g. loading matches or chatting with the AI concierge) can trigger a cold start and may take up to 50–90 seconds to respond. Subsequent requests will load instantly.

---

## Architecture Overview

StadiumPulse integrates a traditional graph-based pathfinding engine with Generative AI (Google Gemini 2.5 Flash) to solve complex wayfinding, crowd management, and customer support queries safely and dynamically.

```text
               +-------------------------------------------+
               |           StadiumPulse Client (React)     |
               |  (Tailwind Dark Theme, WCAG AA Compliant)  |
               +--------------------+----------------------+
                                    | REST APIs (Axios)
                                    v
               +--------------------+----------------------+
               |      Express.js Backend & JWT Guard       |
               +----------+--------------------+-----------+
                          |                    |
                          | (Shortest Path)    | (Retrieval-Augmented
                          v                    |  Generation / RAG)
               +----------+-----------+        v
               |  Dijkstra Pathfinder |  +-----+-------------+
               |  (Step-Free Filter)  |  |  MongoDB Database |
               +----------+-----------+  |  - Zones/Occupancy|
                          |              |  - RAG Protocols  |
                          | Node Chain   |  - Eco logs       |
                          v              +-----+-------------+
               +----------+--------------------+-----------+
               |         Google Gemini 2.5 Flash API       |
               | (Language Translation & Natural synthesis) |
               +-------------------------------------------+
```

---

## Core AI Features

1. **AI Navigation & Wayfinding Assistant**: Rather than making the LLM invent layout coordinates, the backend Dijkstra engine calculates the exact shortest node path first (e.g. `Gate 1 -> Zone A -> Elevator E1 -> Seat Block 102`). The node chain and the fan's query are then fed to Gemini, which synthesizes human-descriptive directions in the fan's language.
2. **Multilingual Real-Time Support**: Every navigation instruction dynamically auto-detects the fan's query language and translates/formats responses into English, Spanish, French, or Arabic natively.
3. **Crowd Management & Alerts**: High-congestion zones (over 85% occupancy) are flagged in the database. Gemini evaluates the congestion metrics and writes plain-language operational summaries and recommended redirect actions (e.g. queue diversion plans) for venue coordinators.
4. **RAG Volunteer Copilot**: Volunteer assistants query security and help protocols in MongoDB. The backend uses keyword matching to retrieve official protocols, and Gemini formats the text into bulleted, actionable checklists readable on mobile devices.
5. **Sustainability Insights**: Gemini analyzes water, electricity, and waste metrics log histories, outputting suggestions for optimization tips directly to the website footer.

---

## Accessibility

StadiumPulse strictly implements **WCAG 2.1 AA** compliance throughout the application. 

### Implementation Decisions
- **Keyboard Navigation**: All inputs, buttons, dropdown selectors, and links are focusable and operable via `Tab`, `Shift+Tab`, `Enter`, and `Space`.
- **Keyboard Outline States**: A high-visibility amber focus ring (`#F59E0B`) outline is applied via Tailwind to all active elements.
- **Skip to Content Link**: A visually hidden `Skip to Main Content` link is mounted at the top of the body, allowing screen-readers and keyboard navigators to jump straight to the `<main>` tag.
- **Color Contrast**: Backgrounds utilize a dark slate (`#0B0F19`) coupled with highly contrasting green (`#10B981`) and gold (`#F59E0B`) typography satisfying the 4.5:1 ratio for low-vision accessibility.
- **ARIA Semantic Layouts**: Every page uses appropriate HTML5 sections (`<main>`, `<nav>`, `<footer >`, `<button>`). Dynamic status panels and chat logs employ `aria-live` and `role="status"` tags to alert screen-readers of dynamic updates.
- **Screen Reader Testing**: The accessibility layout was evaluated using the **axe-core** browser extension and Chrome DevTools Lighthouse audit to guarantee zero accessibility blocker warnings.

---

## Project Structure

```text
smart-stadiums/
├── client/                  # Vite React Frontend
│   ├── src/
│   │   ├── components/      # Reusable elements (Navbar, Charts, Chats, SkipLinks)
│   │   ├── context/         # React Auth context
│   │   ├── pages/           # Fan, Organizer, Accessibility, Volunteer, Login pages
│   │   ├── utils/           # Axios helper
│   │   └── index.css        # Tailwind style design rules
│   ├── tests/               # Vitest component tests
│   └── vite.config.js       # Vitest setup configurations
├── server/                  # Node.js Express Backend
│   ├── controllers/         # API business logics
│   ├── middleware/          # JWT authorization guards & global error middleware
│   ├── models/              # User, Zone, Protocol, Match, Sustainability Mongoose schemas
│   ├── routes/              # Express API routing mounts
│   ├── services/            # Pathfinding Dijkstra service and Gemini AI Service wrapper
│   ├── tests/               # Jest backend test suites
│   ├── db.js                # MongoDB connection helper
│   ├── seed.js              # Database seed script
│   └── server.js            # Express launcher
├── README.md                # Platform documentation
├── .env.example             # Configuration templates
└── package.json             # Workspace coordinator
```

---

## Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas cloud URI)

### 2. Setting Environment Variables
Create a `.env` file inside the `server/` directory and configure the variables:

```env
GEMINI_API_KEY=your_google_gemini_api_key
MONGO_URI=mongodb+srv://your_username:your_password@stadiumpulse.mongodb.net/stadiumpulse
JWT_SECRET=your_stadiumpulse_secure_jwt_token_secret
NODE_ENV=development
PORT=5000
```

> ⚠️ **Never commit `.env` to version control.** A root-level `.gitignore` should include `node_modules/` and `.env`. Rotate your Gemini API key and MongoDB password before making this repository public if they were ever shared outside your local machine.

### 3. Install Dependencies
Run from the root directory `smart-stadiums/`:
```bash
npm install
npm install --prefix server
npm install --prefix client
```
> The root `npm install` pulls in `concurrently`, used to run both the server and client together (see step 5).

### 4. Seed Mock Data
Seed the MongoDB collections with zones, matches, protocols, and mock credentials:
```bash
npm run seed --prefix server
```

### 5. Running the Application
From `smart-stadiums/`, run:
```bash
npm run dev
```
This uses `concurrently` to launch both processes in one terminal, cross-platform (Windows/Mac/Linux):
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

> **Note:** Do not use `npm run dev --prefix server & npm run dev --prefix client` directly on Windows — `&` runs commands sequentially in `cmd.exe` rather than in parallel, so the client process never starts. The root `dev` script handles this correctly.

### 6. Demo Login Credentials

For judges/reviewers evaluating role-based views, use the **"View As" quick-switcher** in the navbar, or log in manually with:

| Role | Email | Password |
|------|-------|----------|
| Organizer | `organizer@stadiumpulse.com` | `password123` |
| Staff | `staff@stadiumpulse.com` | `password123` |
| Volunteer | `volunteer@stadiumpulse.com` | `password123` |

Fans require no login — the Fan Concierge and Accessibility Concierge pages are open by default.

> These are seeded demo accounts for evaluation only — not representative of production auth practices.

---

## Testing

StadiumPulse has comprehensive test coverage:
- **Backend Tests (Jest + Supertest)**: Validates authentication routes, live crowd density updates, Dijkstra coordinates, and mocks the Gemini response.
- **Frontend Tests (Vitest + React Testing Library)**: Tests component mounting, chat message flows, JSDOM ResizeObservers, and accessible tab focus layouts.

### How to Run Tests

- **Run all tests (Backend & Frontend) from root**:
  ```bash
  npm run test
  ```

- **Run backend tests only**:
  ```bash
  npm run test --prefix server
  ```

- **Run frontend tests only**:
  ```bash
  npm run test --prefix client
  ```

---

## Future Scope

1. **Integrated Transit Routing**: Expand Dijkstra pathfinding to include light-rail, shuttle buses, and parking lot capacity indicators, showing fans the best transportation routes home based on post-match congestion.
2. **Dynamic Crowd IoT Sensors**: Link zone occupancy rates to live ticket-scanning turns and security camera feeds to automate density alerts without manual updates.
3. **GenAI Volunteer Translation Channel**: Support real-time speech translation interfaces so stadium volunteers can act as local translators for international visitors.

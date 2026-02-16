# Metis — Product Requirements Document (Frontend: Signup, Login, Onboarding)

## 1. Overview

**Metis** is a local-first AI assistant for neurodiversity. The backend is FastAPI + MongoDB; the AI core is BitNet (llama.cpp) running as per-user subprocesses. Security uses JWT and Microsoft Presidio for PII masking. This PRD describes the **signup → login → onboarding → dashboard** flow and the APIs required to build the **signup**, **login**, and **onboarding** frontend pages.

---

## 2. Application Flow

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Signup    │ ──► │    Login    │ ──► │  Onboarding  │ ──► │  Dashboard  │
│   (guest)   │     │ (JWT issued)│     │ (profile +   │     │ (tasks,     │
│             │     │             │     │  AI started) │     │  brain dump) │
└─────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
  POST /auth/signup   POST /auth/login   POST /api/onboarding
  (no auth)           (no auth)         (Bearer JWT required)
```

- **Signup**: User registers with email + password. Backend creates an isolated DB name and user record; response indicates redirect to **Login**.
- **Login**: User submits email + password. Backend returns a JWT. Frontend should then call an endpoint (or use a “post-login” check) to decide redirect:
  - If user has **no** `neural_profile` → redirect to **Onboarding**.
  - If user **has** `neural_profile` → redirect to **Dashboard**.
- **Onboarding**: Authenticated user submits the **NeurologicProfile** (name + questionnaire answers). Backend saves profile and starts the user’s dedicated AI process; response indicates redirect to **Dashboard**.
- **Dashboard**: Authenticated user sees tasks/jobs and can do brain dumps. Served by dashboard APIs (not in scope of this PRD’s “pages to build”).

---

## 3. API Summary for Signup, Login, Onboarding

| Step       | Method | Endpoint            | Auth        | Purpose                          |
|-----------|--------|---------------------|------------|-----------------------------------|
| Signup    | POST   | `/auth/signup`      | None       | Register; then go to Login        |
| Login     | POST   | `/auth/login`       | None       | Get JWT; then decide Onboarding vs Dashboard |
| Onboarding| POST   | `/api/onboarding`   | Bearer JWT | Submit profile; start AI; go to Dashboard |

Base URL is the backend root (e.g. `http://localhost:8000`). All POST bodies are JSON; login uses `application/x-www-form-urlencoded` when using OAuth2PasswordBearer `tokenUrl="auth/login"` — for a SPA, prefer sending JSON and ensuring the login route accepts JSON (current implementation uses a Pydantic body, so JSON is fine).

---

## 4. API Details

### 4.1 Signup

- **Endpoint:** `POST /auth/signup`
- **Auth:** None
- **Request body (JSON):**

| Field     | Type   | Required | Description  |
|----------|--------|----------|--------------|
| `email`  | string | Yes      | User email   |
| `password` | string | Yes    | Plain password (sent over HTTPS in production) |

**Example:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Responses:**

- **200:** Signup success  
  - Body: `{ "status": "success", "redirect": "/login" }`  
  - Frontend: redirect user to **Login** page.
- **400:** Email already exists  
  - Body: `"email already exists"` (or similar)  
  - Frontend: show error, e.g. “Email already registered”.

---

### 4.2 Login

- **Endpoint:** `POST /auth/login`
- **Auth:** None
- **Request body (JSON):**

| Field     | Type   | Required | Description  |
|----------|--------|----------|--------------|
| `email`  | string | Yes      | User email   |
| `password` | string | Yes    | User password |

**Example:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Responses:**

- **200:** Login success  
  - Body: `{ "access_token": "<JWT>", "token_type": "bearer", "redirect": "/onboarding" }`  
  - Frontend: store `access_token` (e.g. in memory or httpOnly cookie). The backend currently always returns `redirect: "/onboarding"`; the frontend should decide:
    - Call `GET /api/dashboard/state` with `Authorization: Bearer <token>`:
      - **404** (profile not found) → redirect to **Onboarding**.
      - **200** → redirect to **Dashboard**.
- **401:** Invalid credentials  
  - Frontend: show “Invalid email or password”.

**Subsequent requests:** Send the token in the header:

```
Authorization: Bearer <access_token>
```

---

### 4.3 Onboarding (Submit Questionnaire)

- **Endpoint:** `POST /api/onboarding`
- **Auth:** Required — `Authorization: Bearer <access_token>`
- **Request body (JSON):** A single object that matches **NeurologicProfile** (and thus the questionnaire below).

| Field                 | Type   | Required | Allowed values / notes |
|-----------------------|--------|----------|-------------------------|
| `name`                | string | Yes      | Display name            |
| `visualmode`          | string | Yes      | `"standard"` \| `"dyslexic"` |
| `granularity`         | string | Yes      | `"high"` \| `"low"` \| `"overview"` |
| `gamification`        | string | Yes      | `"standard"` \| `"gamified"` |
| `communication_style`| string | Yes      | `"gentle"` \| `"direct"` \| `"drill_sergeant"` |

**Example:**

```json
{
  "name": "Alex",
  "visualmode": "dyslexic",
  "granularity": "high",
  "gamification": "gamified",
  "communication_style": "gentle"
}
```

**Responses:**

- **200 — New profile:**  
  - Body: `{ "id": "<x_user_id>", "status": "saved", "redirect": "/dashboard" }`  
  - Frontend: redirect to **Dashboard**.
- **200 — Profile already exists (e.g. re-submit):**  
  - Body: `{ "id": "<x_user_id>", "status": "already exists", "redirect": "/dashboard" }`  
  - Frontend: redirect to **Dashboard**.
- **401/403:** Invalid or missing token → redirect to Login.

---

## 5. Onboarding Questionnaire (UI → API Mapping)

The onboarding page should ask the following and send one **POST /api/onboarding** request with the combined answers.

---

### Section 1 — Name

- **Question:** Name of the user (or “What should we call you?”).
- **API field:** `name` (string).  
- **UI:** Single text input.

---

### Section 2 — Visual mode (dyslexia / visual stress)

- **Goal:** Mitigate visual stress and dyslexia-related reading barriers.
- **Question:** How would you like the text to look?

| Option | Label in UI | API value for `visualmode` |
|--------|-------------|----------------------------|
| A      | Standard Mode: Clean, modern interface with standard fonts. | `"standard"` |
| B      | Dyslexic-Friendly: High-contrast layout using the OpenDyslexic font, increased letter spacing, and specialized color themes to prevent “visual vibrations.” | `"dyslexic"` |

---

### Section 3 — Task granularity

- **Goal:** Address task paralysis by choosing how deep the AI should “slice” a project.
- **Question:** When you have a big goal (e.g. “Clean the Kitchen”), how do you want me to show it?

| Option | Label in UI | API value for `granularity` |
|--------|-------------|-----------------------------|
| A      | High Detail (The Micro-Step): Break it into tiny, 5-minute actions (e.g. “Pick up one spoon,” “Open the dishwasher”). | `"high"` |
| B      | Standard (Logical Steps): Break it into functional phases (e.g. “Clear the counters,” “Load the dishwasher”). | `"low"` |
| C      | Overview: Just give me the main objectives; I’ll handle the details. | `"overview"` |

---

### Section 4 — Communication tone

- **Goal:** Match the user’s preference (Direct vs. Supportive).
- **Question:** How should I talk to you while we work?

| Option | Label in UI | API value for `communication_style` |
|--------|-------------|--------------------------------------|
| A      | The Gentle Coach: Use soft, validating language. Give me “micro-wins” and tell me it’s okay to be stuck. | `"gentle"` |
| B      | The Direct Strategist: Be literal and concise. No fluff, no emojis—just the facts and instructions. | `"direct"` |
| C      | The Accountability Partner: Be firm and high-energy. Use active verbs and keep me moving forward. | `"drill_sergeant"` |

---

### Section 5 — Gamification

- **Goal:** Dopamine-driven rewards for users who struggle with task initiation.
- **Question:** Do you want to turn your day into a quest?

| Option | Label in UI | API value for `gamification` |
|--------|-------------|-----------------------------|
| A      | Gamified: I want to earn XP, level up, and see “Quest Completed” animations for every task. | `"gamified"` |
| B      | Minimalist: Keep it professional. I just want to see a clean list with checkmarks. | `"standard"` |

---

## 6. Post-login redirect logic (frontend)

1. User submits **Login**; backend returns `access_token` and `redirect: "/onboarding"`.
2. Frontend stores the token and then:
   - Call **GET /api/dashboard/state** with `Authorization: Bearer <access_token>`.
   - If response is **404** (e.g. “Profile not found; complete onboarding first”) → redirect to **Onboarding**.
   - If response is **200** → redirect to **Dashboard** (user already has a profile).

This gives correct routing regardless of the backend’s default `redirect` in the login response.

---

## 7. Data model reference (NeurologicProfile)

Defined in `server/schemas.py`; used for **POST /api/onboarding**:

- **name:** str  
- **visualmode:** `VisualMode` → `"standard"` \| `"dyslexic"`  
- **granularity:** `Granularity` → `"low"` \| `"high"` \| `"overview"`  
- **gamification:** `Gamification` → `"standard"` \| `"gamified"`  
- **communication_style:** `CommunicationStyle` → `"direct"` \| `"gentle"` \| `"drill_sergeant"`

All of these are sent in a single JSON body for the onboarding API.

---

## 8. Summary: What to build

- **Signup page:** Form (email, password) → `POST /auth/signup` → on success, redirect to Login.
- **Login page:** Form (email, password) → `POST /auth/login` → store JWT → `GET /api/dashboard/state` → redirect to Onboarding or Dashboard.
- **Onboarding page:** Multi-section form (name + Sections 2–5) → `POST /api/onboarding` with Bearer token → on success, redirect to Dashboard.

All APIs expect JSON bodies except where noted; auth for onboarding and dashboard is `Authorization: Bearer <access_token>`.

# 🗑️ Smart Dustbin Management System

A full-stack IoT-powered smart waste management platform that monitors dustbin fill levels in real-time, classifies waste using AI, optimizes collection routes, and sends instant alerts — all from a modern web dashboard.

🌐 **Live Demo:** [smart-dustbin-n0il0j8jq-rajeshs-projects-d4731235.vercel.app](https://smart-dustbin-n0il0j8jq-rajeshs-projects-d4731235.vercel.app)

---

## ✨ Features

- 📡 **Real-Time IoT Monitoring** — Live fill-level data streamed from NodeMCU/ESP8266 sensors
- 🤖 **AI Waste Classifier** — Classifies waste as recyclable/non-recyclable using Google Gemini AI and camera/image upload
- 🗺️ **Google Maps Integration** — Visual map showing all dustbin locations with color-coded status markers
- 🚌 **Bus Route Optimizer** — Nearest-neighbor algorithm to generate the most efficient waste collection route
- 📍 **Nearest Dustbin Finder** — Uses browser geolocation to find and navigate to the closest bin
- 🔔 **Instant Alerts** — Sends SMS (Twilio) and Email (Resend) when a bin hits critical capacity
- 🔐 **Secure Authentication** — Powered by Clerk with role-based access
- 🌙 **Dark Mode** — Full dark/light theme toggle
- 🔥 **Firebase Backend** — Real-time database for dustbin data and alert logs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Clerk |
| Database | Firebase Firestore |
| AI Classification | Google Generative AI (Gemini) |
| Maps | Google Maps API (@react-google-maps/api) |
| ML (client-side) | TensorFlow.js + MobileNet |
| SMS Alerts | Twilio |
| Email Alerts | Resend |
| IoT Hardware | NodeMCU ESP8266 + Ultrasonic Sensor |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A NodeMCU ESP8266 (for hardware integration)

### 1. Clone the repository

```bash
git clone https://github.com/rajeshsingh241/smart-dustbin.git
cd smart-dustbin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Twilio (SMS Alerts)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Resend (Email Alerts)
RESEND_API_KEY=your_resend_api_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
smart-dustbin/
├── app/
│   ├── api/                  # API routes (alerts, classifier, NodeMCU proxy)
│   ├── dashboard/            # Protected dashboard page
│   ├── sign-in/              # Clerk sign-in page
│   ├── sign-up/              # Clerk sign-up page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with Clerk + ThemeProvider
│   └── page.tsx              # Landing/home page
├── components/
│   ├── DashboardContent.tsx  # Main dashboard with all tabs and live data
│   ├── WasteClassifier.tsx   # AI-powered waste classification UI
│   ├── BusRouteOptimizer.tsx # Collection route optimization
│   ├── MapView.tsx           # Google Maps dustbin visualization
│   ├── NearestDustbin.tsx    # Geolocation-based bin finder
│   ├── AddDustbinModal.tsx   # Modal to add new dustbins
│   ├── DarkModeToggle.tsx    # Light/dark theme toggle
│   └── themeprovider.tsx     # Theme context provider
├── arduino/                  # NodeMCU ESP8266 firmware code
├── lib/                      # Firebase config and utility functions
├── types/                    # TypeScript type definitions
├── public/                   # Static assets
└── proxy.ts                  # NodeMCU data proxy
```

---

## 🔧 Hardware Setup (NodeMCU + Ultrasonic Sensor)

The system integrates with a **NodeMCU ESP8266** connected to an **HC-SR04 ultrasonic sensor** mounted inside each dustbin lid.

- The sensor measures the distance from the lid to the waste level
- Fill percentage is calculated and pushed to the server via HTTP
- The dashboard polls the NodeMCU endpoint and updates fill levels in real time

Firmware code is available in the `/arduino` folder.

---

## 📊 Dashboard Overview

| Tab | Description |
|---|---|
| Overview | Live stats — total bins, critical count, average fill level |
| Map View | Google Maps with color-coded bin markers (green/yellow/red) |
| Alerts | Log of all SMS/email alerts sent with timestamps |
| Waste Classifier | Upload or capture an image to identify waste type with AI |
| Route Optimizer | Generate and simulate the optimal garbage truck route |
| Nearest Bin | Use your location to find the closest available dustbin |

---

## 🚨 Alert System

When a dustbin reaches **critical capacity (≥ 80%)**, the system automatically:

1. Sends an **SMS** via Twilio to the assigned operator
2. Sends an **Email** via Resend with bin location and fill level
3. Logs the alert in the dashboard with status tracking

---

## 🤖 AI Waste Classifier

- Upload an image or use your **live camera**
- Google Gemini AI analyzes the image and classifies the waste
- Result shows: waste type, recyclable/non-recyclable status, confidence level, and which bin to use
- Classification history is tracked in the session

---

## 🌐 Deployment

This project is deployed on **Vercel**.

To deploy your own instance:

1. Push the code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Add your Vercel domain to:
   - **Clerk** → Allowed redirect URLs
   - **Firebase** → Authorized domains
5. Click Deploy ✅

---

## 📄 License

This project is for educational and hackathon purposes.

---

## 👨‍💻 Author

**Rajesh Singh** — [GitHub](https://github.com/rajeshsingh241)
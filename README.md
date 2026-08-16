# Stay N Joy — AI-Powered Stay Booking Platform

Stay N Joy is a full-stack stay booking platform inspired by modern accommodation platforms. It allows users to discover properties, view detailed listings, manage listings, write reviews, explore locations on maps, and use AI-powered tools to plan trips and search for stays naturally.

The project focuses on building a simple, modern and intelligent travel experience using a MERN-based architecture.

## 🚀 Key Features

### 🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Protected API routes
- User-specific actions and ownership validation

### 🏠 Property Listings

- Browse available stays
- View detailed property information
- Create, update and delete listings
- Property images, pricing, location, amenities and host information
- Ownership-based access control

### ⭐ Reviews

- Add reviews to listings
- Delete your own reviews
- Author-level permissions
- Integrated review and listing data

### 🔎 Smart Search & Discovery

- Category-based filtering
- Price and sorting controls
- Natural-language search powered by AI
- Converts user queries into structured listing filters

### 🗺️ Maps & Location

- Mapbox integration for property locations
- Location visualization for listings
- Route and stop visualization for generated trip plans
- Location validation to improve map accuracy

### 🤖 AI-Powered Travel Tools

- **AI Smart Search:** Search for stays using natural language.
- **AI Trip Planner:** Generate day-by-day travel itineraries with mapped locations.
- **AI Assistant:** Ask questions about listings using data-grounded responses.

### 📱 Modern Frontend

- React + Vite
- Responsive user interface
- Reusable React components
- Protected routes
- Centralized authentication state
- Tailwind CSS and component-based UI

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Mapbox

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication

### Database

- MongoDB
- Mongoose

### AI & Integrations

- Groq
- AI-powered search and itinerary generation
- Mapbox APIs

### Development Tools

- Git
- GitHub
- VS Code

## 🏗️ Architecture

    ┌─────────────────────┐
    │     React Client    │
    │  Frontend / Vite    │
    └──────────┬──────────┘
               │
               │ REST API
               ▼
    ┌─────────────────────┐
    │   Express Backend   │
    │   Node.js / APIs    │
    └──────────┬──────────┘
               │
       ┌───────┼───────────────┐
       ▼       ▼               ▼
    ┌───────┐ ┌────────────┐ ┌───────────┐
    │MongoDB│ │AI Services │ │  Mapbox   │
    │Database││Search/Chat │ │   Maps    │
    └───────┘ └────────────┘ └───────────┘

## 🤖 AI Features

### 1. Natural-Language Smart Search

Users can search for properties using conversational queries instead of manually selecting multiple filters.

Example:

    Find an affordable stay near Bangalore with good reviews

The AI converts the query into structured search parameters and retrieves relevant listings.

### 2. AI Trip Planner

Users can generate personalized travel itineraries with:

- Day-by-day plans
- Suggested places
- Mapped stops
- Route visualization

### 3. AI Listing Assistant

The application provides an AI assistant that can answer questions about available listings using application data.

## 🔒 Security

- JWT-based API authentication
- Protected routes for authenticated operations
- Ownership validation for listing and review modifications
- Environment variables for sensitive configuration
- API keys and secrets are excluded from the repository

> Never place real API keys, database credentials or other secrets directly in the source code.

## 💻 Local Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB
- Git

### 1. Clone the Repository

    git clone https://github.com/Tannusinghh/stay-n-joy.git
    cd stay-n-joy

### 2. Start the Backend

    cd Backend
    npm install
    npm run dev

### 3. Start the Frontend

Open another terminal:

    cd Frontend/client
    npm install
    npm run dev

### 4. Environment Variables

Create the required `.env` files for the backend and frontend and configure the required database, authentication, AI and Mapbox credentials.

Do not commit `.env` files to GitHub.

## 📂 Project Structure

    stay-n-joy/
    │
    ├── Backend/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   │   └── api/
    │   ├── services/
    │   ├── scripts/
    │   └── app.js
    │
    ├── Frontend/
    │   └── client/
    │       └── src/
    │           ├── components/
    │           ├── context/
    │           ├── pages/
    │           ├── api.js
    │           ├── App.jsx
    │           └── main.jsx
    │
    ├── .gitignore
    └── README.md

## 🎯 What I Learned

Through Stay N Joy, I gained hands-on experience with:

- Full-stack web application development
- REST API design and integration
- React component-based development
- Authentication and authorization
- MongoDB data modeling
- CRUD operations
- Third-party API integration
- Map-based functionality
- AI feature integration
- Frontend and backend integration
- Git and GitHub workflow
- Building features around real user requirements

## 🔮 Future Improvements

Potential future improvements include:

- Online booking and payment integration
- Advanced personalized recommendations
- Host dashboard and analytics
- Multilingual support
- Improved recommendation algorithms
- Deployment and production monitoring
- Automated testing

## 👨‍💻 Project

**Stay N Joy**

Full-Stack AI-Powered Stay Booking Platform

Built using **React, Node.js, Express, MongoDB, JavaScript, Tailwind CSS, Mapbox and AI services.**

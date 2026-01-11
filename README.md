# The Metal Store Landing Page

## 1. Purpose
E-commerce platform for furniture and metal artifacts.

## 2. System Context
*   **Type**: Vite / React Application
*   **Backend Connection**: Connects to `Genius Backend` (specifically the `ecommerce` module).
*   **Brand Slug**: `themetalstore`

## 3. Key Locations
*   **Entry**: `frontend/src/main.jsx` (Note the `frontend` subfolder).
*   **Chat Widget**: `frontend/src/components/ChatWidget.jsx`
*   **Product Logic**: Fetches from backend ecommerce endpoints.

## 4. Development (Isolation)
**Folder**: `themetalstore-landing/`

### Setup
```bash
cd frontend
npm install
# Ensure .env has:
# VITE_API_URL=http://localhost:8000
# VITE_BRAND_SLUG=themetalstore
```

### Run
```bash
npm run dev -- --port 3005
```
Access at: `http://localhost:3005` or `https://themetal.store` (Production)

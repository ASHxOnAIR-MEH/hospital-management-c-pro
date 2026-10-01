# Hospital Bed Monitoring System — React Frontend

Touch-friendly, high-contrast healthcare dashboard designed for non-technical hospital receptionists and ward nurses.

---

## 🛠️ Technology Stack
- **React 19**
- **TypeScript**
- **Vite**
- **Lucide React** (Clinical Iconography)
- **Vanilla CSS3** (Custom Modern Healthcare Design System)

---

## 🚀 Running the Frontend

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Endpoint
Open [`src/config/api.ts`](src/config/api.ts) and set `API_BASE_URL`:
- For local development: `export const API_BASE_URL = "/api";`
- For live Google Apps Script: `export const API_BASE_URL = "https://script.google.com/macros/s/YOUR_EXEC_ID/exec";`

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 4. Build for Production
```bash
npm run build
```
Generates optimized static assets in `dist/`.

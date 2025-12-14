# FocusFlow Frontend

This is the **Frontend** folder for the FocusFlow project (vanilla HTML/CSS/JS).

## What it includes
- Login + Register pages
- Dashboard (KPIs + quick lists)
- Tasks (create + list + complete)
- Timer (focus sessions saved locally)
- Reports (simple insights)
- Settings

## Run it locally (recommended)

### 1) Start the backend (.NET Web API)
From the backend project folder:

```bash
dotnet restore
dotnet run
```

Backend default URL (from launchSettings): `http://localhost:5277`

### 2) Start the frontend with Live Server
Because the backend CORS policy allows `http://127.0.0.1:5500`, use Live Server.

- Open this folder in VS Code
- Right‑click `index.html` → **Open with Live Server**
- Confirm the browser URL starts with: `http://127.0.0.1:5500/...`

## API endpoints used
- POST `/api/Users` (register)
- POST `/api/Users/login` (login)
- GET `/api/Users/{userId}/Tasks` (list tasks)
- POST `/api/Users/{userId}/Tasks` (create task)
- PUT `/api/Users/{userId}/Tasks/{taskId}/Complete` (complete task)

No extra `api.js` file is used.

# Run AnimySaku Store (Frontend + Backend)

## Prerequisites
- Node.js 18+
- MongoDB running locally at `mongodb://localhost:27017`

## One command (recommended)

From project root:

```bash
npm run dev:all
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- MongoDB: `mongodb://localhost:27017` → database `animysaku`

## Or two terminals

**Terminal 1 – Backend**
```bash
cd backend
npm install
npm run dev:clean
```

**Terminal 2 – Frontend**
```bash
npm install
npm run dev
```

## Admin login
- Email: `admin@animysaku.com`
- Password: `adminpassword123`

## Full database seed (optional)
```bash
cd backend
npm run seed
```

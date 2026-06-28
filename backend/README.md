# Anime Ecommerce Backend

Production-ready Node.js + Express + MongoDB backend for anime posters/stickers ecommerce.

## Features

- JWT authentication with access + refresh token flow
- Signup, login, forgot/reset password
- Role-based auth (`admin`, `customer`)
- Product management with search, pagination, filtering, sorting
- Category and subcategory management
- Cart and wishlist APIs
- Order management and order tracking
- Razorpay payment order creation and verification
- Cloudinary image upload and deletion
- Review system with automatic product rating recalculation
- Admin dashboard analytics
- Security hardening (`helmet`, rate limiting, XSS/Mongo sanitize, HPP)

## Setup

1. Copy `.env.example` to `.env`
2. Fill all variables
3. Install and run:

```bash
npm install
npm run dev
```

Server base URL: `http://localhost:5000`

Health check: `GET /health`

## API Base

All APIs are under `/api`:

- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/cart`
- `/api/wishlist`
- `/api/categories`
- `/api/payments`
- `/api/dashboard`

## Example frontend integration

- Save returned `accessToken` from login/signup.
- Send in header:

```http
Authorization: Bearer <accessToken>
```

- Refresh token is stored in secure HTTP-only cookie.

## Deployment Notes (Render / Railway / VPS)

- Set all `.env` variables on platform dashboard
- Enable MongoDB Atlas network access and add DB user credentials
- Set `NODE_ENV=production`
- Set `CLIENT_URL` to deployed frontend domain
- For cross-site cookies in production, use HTTPS frontend and backend

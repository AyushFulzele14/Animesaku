# API Documentation

Base URL: `http://localhost:5000/api`

## Auth Notes

- Protected endpoints require: `Authorization: Bearer <accessToken>`
- Refresh token is stored in secure HTTP-only cookie.
- Roles: `admin`, `customer`

## Response Format

All APIs return:

- success response: `{ success: true, ... }`
- error response: `{ success: false, message: "..." }`

---

## Auth

### `POST /auth/signup`
Create new user account.

Body:

```json
{
  "name": "Aaditya",
  "email": "aaditya@example.com",
  "password": "StrongPass123",
  "role": "customer"
}
```

### `POST /auth/login`
Login with email/password.

### `POST /auth/refresh-token`
Get new access token using refresh token cookie.

### `POST /auth/logout`
Clear refresh token cookie and session token.

### `POST /auth/forgot-password`
Generate password reset token.

Body:

```json
{
  "email": "aaditya@example.com"
}
```

### `POST /auth/reset-password/:token`
Reset password with reset token.

Body:

```json
{
  "password": "NewStrongPass123"
}
```

---

## Products

### `GET /products`
Get products list with search/filter/sort/pagination.

Query params:

- `keyword`
- `page`, `limit`
- `sort` (example: `-createdAt`, `price,-ratings`)
- `category`, `subcategory`
- `trending`, `featured`
- `priceMin`, `priceMax`
- `ratings`

### `POST /products` (admin)
Create product with multiple image upload.

Content-Type: `multipart/form-data`

Fields:

- `title`
- `animeName`
- `category`
- `subcategory`
- `description`
- `price`
- `discountPrice`
- `stockQuantity`
- `type` (`poster` or `sticker`)
- `dimensions`
- `materialQuality`
- `tags` (array/string)
- `featured` (boolean)
- `trending` (boolean)
- `images` (multiple files, max 8)

### `GET /products/:id`
Get single product by ID.

### `PATCH /products/:id` (admin)
Update product by ID.

### `DELETE /products/:id` (admin)
Delete product and linked Cloudinary images.

---

## Reviews

### `POST /products/reviews`
Create or update review for authenticated user.

Body:

```json
{
  "productId": "PRODUCT_ID",
  "rating": 5,
  "comment": "Amazing print quality!"
}
```

### `DELETE /products/reviews/:productId`
Delete current user's review from product.

---

## Categories

### `GET /categories`
Get all categories.

### `POST /categories` (admin)
Create category.

Body:

```json
{
  "name": "Posters"
}
```

### `PATCH /categories/:id` (admin)
Update category.

### `DELETE /categories/:id` (admin)
Delete category and related subcategories.

### `GET /categories/subcategories`
Get all subcategories, optionally by category:

- `/categories/subcategories?category=CATEGORY_ID`

### `POST /categories/subcategories` (admin)
Create subcategory.

Body:

```json
{
  "name": "A3 Posters",
  "categoryId": "CATEGORY_ID"
}
```

---

## Cart

### `GET /cart`
Get logged-in user's cart.

### `POST /cart`
Add item to cart.

Body:

```json
{
  "productId": "PRODUCT_ID",
  "quantity": 2
}
```

### `PATCH /cart`
Update product quantity in cart.

### `DELETE /cart/:productId`
Remove one item from cart.

### `DELETE /cart`
Clear entire cart.

---

## Wishlist

### `GET /wishlist`
Get user's wishlist.

### `POST /wishlist`
Add product to wishlist.

Body:

```json
{
  "productId": "PRODUCT_ID"
}
```

### `DELETE /wishlist/:productId`
Remove product from wishlist.

---

## Orders

### `POST /orders`
Create order from current cart.

Body:

```json
{
  "paymentMethod": "COD",
  "shippingAddress": {
    "fullName": "Aaditya Sharma",
    "phone": "9999999999",
    "addressLine1": "Street 1",
    "city": "Delhi",
    "state": "Delhi",
    "postalCode": "110001",
    "country": "India"
  }
}
```

### `GET /orders/my`
Get logged-in user's order history.

### `GET /orders/track/:id`
Track a specific user order.

### `GET /orders` (admin)
Get all orders.

Optional filters:

- `status` (delivery status)
- `paymentStatus`

### `PATCH /orders/:id/status` (admin)
Update order status.

Body:

```json
{
  "deliveryStatus": "Shipped",
  "trackingStatus": "Shipment handed to courier"
}
```

Order status values:

- `Pending`
- `Confirmed`
- `Packed`
- `Shipped`
- `Delivered`
- `Cancelled`

---

## Payments

### `POST /payments/create-order`
Create Razorpay payment order for existing order.

Body:

```json
{
  "orderId": "ORDER_ID"
}
```

### `POST /payments/verify`
Verify Razorpay payment signature.

Body:

```json
{
  "orderId": "ORDER_ID",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

### `POST /payments/failed`
Mark payment as failed.

Body:

```json
{
  "orderId": "ORDER_ID",
  "reason": "Payment timeout"
}
```

---

## Admin Dashboard

### `GET /dashboard` (admin)
Returns:

- total users
- total orders
- total products
- total revenue
- monthly sales
- best-selling products
- low inventory products

# My Server Mark2
Node.js/Express + MongoDB pet project with a small vanilla JS frontend for product catalog browsing.

## Stack
- Node.js
- Express
- MongoDB + Mongoose
- Vanilla JS + HTML/CSS

## Features
- Products catalog page
- Pagination (`page`, `limit`)
- Search by product name (`search`)
- Sort by created date (`sort=asc|desc`)
- URL-state sync for catalog filters/pagination

## Run Locally
1. Install dependencies:
```bash
npm i
```
2. Create `.env`:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```
3. Run server:
```bash
npm run dev
```
or
```bash
npm start
```
4. Open:
- `http://localhost:3000/index.html`
- `http://localhost:3000/products.html`

## API (minimal)
### `GET /products`
Query params:
- `page` (number)
- `limit` (number)
- `search` (string)
- `sort` (`asc` or `desc`)

Example:
```http
GET /products?page=1&limit=5&search=milk&sort=desc
```

Response shape:
```json
{
  "page": 1,
  "limit": 5,
  "total": 12,
  "products": []
}
```

## Quick Check
1. Open `products.html`
2. Try search + Enter
3. Change sort
4. Click Next/Prev
5. Verify URL query updates and reload page keeps state

## Screenshots
- Add 1-2 screenshots later (`/public` or `/docs` folder)

## Roadmap
- Auth (login/register)
- Product details page
- Better validation + cleaner error responses
- Tests for routes/services

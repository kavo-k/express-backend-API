# My Server Mark2
Express + MongoDB pet project with a products catalog page on vanilla JS.

## Stack
- Node.js
- Express
- MongoDB + Mongoose
- HTML/CSS/Vanilla JS

## Features
- Products list
- Pagination (`page`, `limit`)
- Search (`search`)
- Sort by created date (`sort=asc|desc`)
- URL/state sync for catalog filters

## Run
1. Install deps:
```bash
npm i
```
2. Create `.env`:
```env
MONGODB_URI=your_connection_string
PORT=3000
```
3. Start:
```bash
node index.js
```
4. Open:
- `http://localhost:3000/`

## API
`GET /products?page=1&limit=5&search=milk&sort=desc`

Response:
```json
{
  "page": 1,
  "limit": 5,
  "total": 12,
  "products": []
}
```

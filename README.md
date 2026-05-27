# Market Catalog App

Full-stack marketplace/catalog pet project built with Node.js, Express, MongoDB, Mongoose and vanilla JavaScript.

The project includes product management, authentication, image uploads, favorites, cart, user profiles and product reviews.

## Описание

Полноценный учебный marketplace/catalog проект. В нём реализованы каталог товаров, авторизация, профиль пользователя, загрузка изображений, избранное, корзина и отзывы.

Проект сделан как pet project для практики backend/frontend разработки и демонстрации базовой full-stack архитектуры.

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- Multer
- Cloudinary
- HTML
- CSS
- Vanilla JavaScript

## Features

- User registration and login
- JWT-protected routes
- User profile editing
- Avatar upload with Cloudinary
- Product creation, editing and deletion
- Multiple product images
- Main product image selection
- Cloudinary image optimization
- Product search, filtering, sorting and pagination
- Favorites
- Cart with quantity controls
- Product reviews
- Review editing and deletion
- Admin/owner permission checks
- Password reset token flow

## Возможности

- Регистрация и вход пользователя
- Защищённые роуты через JWT
- Редактирование профиля пользователя
- Загрузка аватара через Cloudinary
- Создание, редактирование и удаление товаров
- Загрузка нескольких изображений товара
- Выбор главного изображения товара
- Оптимизация изображений через Cloudinary
- Поиск, фильтрация, сортировка и пагинация товаров
- Избранное
- Корзина с изменением количества товаров
- Создание, редактирование и удаление отзывов
- Проверка прав владельца и администратора
- Сценарий сброса пароля через токен

## Architecture

The backend is split into simple layers:

```txt
routes/
  HTTP routes, request validation, permissions

services/
  database logic and reusable business actions

models/
  Mongoose schemas

middlewares/
  auth and file upload middleware

config/
  external service configuration

public/
  vanilla JS frontend, HTML and CSS
```

Cloudinary upload/delete/optimized URL logic is moved into `services/upload.service.js`, so route files do not contain low-level upload stream logic.

## Main Modules

- Products: CRUD, owner/admin access, image upload, optimized images
- Users: auth, profile update, avatar upload, password reset token
- Reviews: create, edit, delete, user/admin permissions
- Cart: add, decrease, remove, clear
- Favorites: add, remove, clear

## API Overview

### Auth / Users

```txt
POST   /users/register
POST   /users/login
POST   /users/forgot-password
PUT    /users/reset-password
PUT    /users/me
PUT    /users/me/avatar
GET    /users/:id
GET    /users/:id/products
```

### Products

```txt
GET    /products
GET    /products/my
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id
```

### Reviews

```txt
GET    /products/:productId/reviews
POST   /products/:productId/review
PUT    /products/:productId/review/:reviewId
DELETE /products/:productId/review/:reviewId
```

### Cart

```txt
GET    /cart
POST   /cart/items
PATCH  /cart/items/:productId/decrease
DELETE /cart/items/:productId
DELETE /cart/items
```

### Favorites

```txt
GET    /favorites
POST   /favorites/items
DELETE /favorites/items/:productId
DELETE /favorites/items
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Open the app:

```txt
http://localhost:3000
```

## What I Practiced

- REST API design with Express
- MongoDB data modeling with Mongoose
- JWT authentication and route protection
- Owner/admin authorization checks
- File uploads with Multer memory storage
- Cloudinary upload, deletion and image optimization
- Frontend state updates with vanilla JavaScript
- FormData, JSON requests and async/await
- Splitting backend code into routes, services, models and middleware

## Что я практковал

- Проектирование REST API на Express
- Моделирование данных в MongoDB через Mongoose
- Аутентификацию и защиту роутов через JWT
- Проверку прав владельца и администратора
- Загрузку файлов через Multer memory storage
- Загрузку, удаление и оптимизацию изображений через Cloudinary
- Обновление интерфейса на vanilla JavaScript
- Работу с FormData, JSON-запросами и async/await
- Разделение backend-кода на роуты, сервисы, модели и middleware

## Project Status

Core marketplace functionality is implemented. The project is mainly used as a learning and portfolio project before moving to React, TypeScript and larger full-stack applications.

Основная функциональность marketplace реализована. Проект использовался как учебный и портфолио-проект перед переходом к React, TypeScript и более крупным full-stack приложениям.

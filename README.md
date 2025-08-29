## Moda Pazarı

Moda Pazarı is a full-stack e-commerce platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with TypeScript for type safety and scalability. The platform is designed to provide a seamless online shopping experience for users while offering administrators efficient tools for managing products, orders, and customers.

## Features

## User-Facing Features

# User Authentication & Authorization:
Secure sign-up, login, and JWT-based session management.

# Product Catalog:
Browse products with images, detailed descriptions, pricing, and availability.

# Search & Filtering:
Find products using category, brand, and keyword-based filters.

# Shopping Cart & Checkout:
Add products to the cart, update quantities, and proceed through a secure checkout process.

# Payment Integration:
Connects with external payment gateways (Stripe/Paystack/PayPal depending on configuration).

# Order History:
Users can view and track their past and current orders.

# Responsive UI:
Mobile-first, responsive design ensuring accessibility across devices.

## Admin Features

# Product Management:
Create, update, delete, and manage product listings.

# Order Management:
View, update, and fulfill customer orders.

# User Management:
Manage registered users and their roles.

## Dashboard Analytics:
Gain insights into sales, user activity, and product performance.

## Tech Stack
# Frontend

React.js with TypeScript

Zustand Toolkit (for state management)

React Router (for client-side routing)

Tailwind CSS (for responsive styling)

# Backend

Node.js with Express.js

TypeScript for strong typing and maintainability

MongoDB with Mongoose for database modeling

JWT (JSON Web Tokens) for authentication

## Additional Integrations

Payment Gateway API (Stripe, Paystack, or PayPal)

Nodemailer for transactional emails 

## Architecture

The platform follows a modular MVC-inspired architecture:

Frontend: SPA (Single Page Application) consuming backend APIs

Backend: RESTful API with controllers, services, and middleware

Database: NoSQL MongoDB with collections for Users, Products, Orders, and Categories

Authentication: JWT-based, with role-based access control for users and admins

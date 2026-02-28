# 🏠 Localify — Local Service Provider Platform

A full-stack **MERN** (MongoDB, Express, React, Node.js) web application that connects homeowners with trusted local service providers like electricians, plumbers, carpenters, and more.

![Tech Stack](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white)

---

## ✨ Features

### For Users
- 🔍 **Search & Filter** — Find service providers by category, location, price, and rating
- 📅 **Book Services** — Schedule appointments with preferred date, time, and address
- 💳 **Secure Payments** — Pay via Razorpay (UPI, Net Banking, Cards)
- ⭐ **Reviews & Ratings** — Rate providers and read genuine customer reviews
- 📊 **User Dashboard** — Track bookings, view stats, and manage your account

### For Service Providers
- 🏢 **Provider Registration** — Register your business with services, pricing, and availability
- 📋 **Booking Management** — Accept, decline, start, and complete bookings
- 📈 **Analytics Dashboard** — Revenue trends, booking stats, customer demographics, and peak hours (powered by Recharts)
- 🕐 **Availability Control** — Set working days, hours, and toggle availability

### For Admins
- 👥 **User Management** — View and manage all users
- ✅ **Provider Verification** — Verify service providers
- 🛡️ **Review Moderation** — Approve or reject customer reviews
- 📂 **Category Management** — Create, edit, and delete service categories
- 📊 **Platform Overview** — Dashboard with key stats

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Tailwind CSS 3.4, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **Payments** | Razorpay (Test Mode) |
| **Notifications** | React Hot Toast |
| **Deployment** | Render (Backend), Vercel (Frontend) |

---

## 📁 Project Structure

```
Localify/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── bookings/       # BookingCard
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   ├── providers/      # ProviderCard
│   │   │   ├── reviews/        # ReviewCard, ReviewForm
│   │   │   ├── ui/             # LoadingSpinner, StarRating
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── context/            # AuthContext (React Context API)
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── BookService.jsx
│   │   │   ├── BookingDetails.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── ProviderProfile.jsx
│   │   │   ├── ProviderRegister.jsx
│   │   │   ├── ProviderDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/           # Axios API service layer
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css           # Tailwind + custom component classes
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js             # JWT protect & role authorize
│   │   ├── errorHandler.js
│   │   └── validate.js         # express-validator middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── ServiceProvider.js
│   │   ├── Booking.js
│   │   ├── Category.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── providers.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   ├── admin.js
│   │   ├── categories.js
│   │   ├── payments.js
│   │   └── analytics.js
│   ├── server.js
│   ├── seed.js                 # Database seeder
│   └── package.json
│
├── package.json                # Root (concurrently scripts)
├── render.yaml                 # Render deployment config
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)
- [Razorpay](https://razorpay.com/) test account (for payments)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/localify.git
cd localify
```

### 2. Install Dependencies

```bash
# Install root, server, and client dependencies
npm run install-all
```

Or manually:

```bash
npm install          # Root (concurrently)
cd server && npm install
cd ../client && npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/localify
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
```

### 4. Seed the Database

```bash
npm run seed
```

This populates the database with sample categories, users, and service providers in the Mumbai area.

### 5. Run the Application

```bash
# Run both server (port 5000) and client (port 3000) concurrently
npm run dev
```

Or separately:

```bash
npm run server   # Backend only
npm run client   # Frontend only
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **User** | `aakarsh@example.com` | `user123` |
| **Provider** | `rajesh.electric@example.com` | `provider123` |

> **Payment Demo:** When making a booking, select **NET BANKING** and choose any bank to complete the test transaction.

---

## 📡 API Endpoints

| Module | Base Route | Description |
|---|---|---|
| Auth | `/api/auth` | Register, Login, Get current user |
| Users | `/api/users` | User bookings, profile |
| Providers | `/api/providers` | CRUD, search, availability, reviews |
| Bookings | `/api/bookings` | Create, update status, cancel |
| Reviews | `/api/reviews` | Create, respond, moderate |
| Categories | `/api/categories` | List all categories |
| Payments | `/api/payments` | Create Razorpay order, verify payment |
| Analytics | `/api/analytics` | Provider revenue, trends, demographics |
| Admin | `/api/admin` | Dashboard stats, user/provider/review management |

Health check available at `GET /health`.

---

## 🎨 UI/UX Highlights

- **Glass Morphism** navbar with scroll-aware styling
- **Animated transitions** — fade-in, slide-up, scale-in effects
- **Custom design system** — gradient avatars, `shadow-card`, `card-interactive` hover effects
- **Skeleton loading** states for better perceived performance
- **Responsive** across mobile, tablet, and desktop
- **Dark modern footer** with social links
- **Interactive star ratings** with hover preview
- **Color-coded status badges** with dot indicators

---

## 🚢 Deployment

### Backend — Render

The project includes a `render.yaml` for one-click deployment on [Render](https://render.com):

- Runtime: Node.js
- Build command: `cd server && npm install`
- Start command: `cd server && node server.js`

### Frontend — Vercel

The client includes a `vercel.json` with SPA rewrite rules:

```bash
cd client
vercel deploy
```

---

## 📄 License

This project is for educational and portfolio purposes.

---

<p align="center">Made with ❤️ in India</p>

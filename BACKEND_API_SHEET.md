# MyBigBazaar — Backend API Master Reference & Developer Handbook

> **Confidential Technical Reference Sheet**  
> **Target Audience:** Backend Developers, DevOps Engineers, Full-Stack Contributors  
> **Status Tagging:** Every endpoint integrated with Mobile (`mobile`), Admin Console (`admin`), or Storefront Web (`web`) is highlighted with <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>.

---

## 1. Production Server & Network Infrastructure

| Parameter | Value | Notes |
| :--- | :--- | :--- |
| **Production Server IP** | `93.127.195.14` | Hostinger Cloud VPS (Ubuntu Linux / Nginx) |
| **API Base URL (Public)** | `https://backend.mybigbazaar.com` | SSL/TLS enabled, reverse-proxied to internal port 5000 |
| **Admin Portal URL** | `https://superadmin.mybigbazaar.com` | Production Admin Panel SPA |
| **Storefront Web URL** | `https://mybigbazaar.com` & `https://www.mybigbazaar.com` | Customer Web Application |
| **Android APK Direct Link** | `https://mybigbazaar.com/downloads/mybigbazaar-v1.0.0.apk` | Served via Nginx static route `/var/www/mybigbazaar.com/downloads/` |
| **Internal Express Port** | `5000` (`http://127.0.0.1:5000`) | Managed by PM2 (`ecosystem.config.cjs` or `pm2 start app.js`) |
| **Nginx Proxy Configuration** | Reverse proxy on 443 | `proxy_pass http://127.0.0.1:5000;` with websocket upgrade headers |

---

## 2. Environment Variables, Connection Strings & Secrets

These values match the active configuration in `apps/api/.env` and `apps/api/config/env.js`.

### A. Database Connection (MongoDB Atlas)

| Configuration Variable | Value |
| :--- | :--- |
| **`MONGO_URI`** | `mongodb+srv://mybigbazaarindia_db_user:AmwKZh9aKkm9sVRK@cluster0.3ahhv3l.mongodb.net/bigbazaar?appName=Cluster0` |
| **Atlas Database Name** | `bigbazaar` |
| **Atlas DB Username** | `mybigbazaarindia_db_user` |
| **Atlas DB Password** | `AmwKZh9aKkm9sVRK` |
| **Cluster Shard 0** | `ac-cmtetxn-shard-00-00.3ahhv3l.mongodb.net:27017` |
| **Cluster Shard 1** | `ac-cmtetxn-shard-00-01.3ahhv3l.mongodb.net:27017` |
| **Cluster Shard 2** | `ac-cmtetxn-shard-00-02.3ahhv3l.mongodb.net:27017` |
| **Critical Network Rule** | Ensure `0.0.0.0/0` (or VPS IP `93.127.195.14/32`) is whitelisted in MongoDB Atlas Network Access. |

### B. Security & Token Secrets

| Configuration Variable | Active Production / Default Value | Purpose |
| :--- | :--- | :--- |
| **`JWT_SECRET`** | `mysecrect123` *(fallback: `dev_jwt_secret_mybigbazaar_key_2026`)* | Signing user authentication tokens |
| **`JWT_EXPIRES_IN`** | `7d` | Token session validity |
| **`PORT`** | `5000` | Node.js Express listener port |
| **`NODE_ENV`** | `production` *(or `development`)* | Runtime environment mode |

### C. Email & SMTP Configuration (Google Workspace / Gmail)

| Configuration Variable | Active Production Value | Notes |
| :--- | :--- | :--- |
| **`EMAIL_HOST`** | `smtp.gmail.com` | Google SMTP server |
| **`EMAIL_PORT`** | `587` | TLS / STARTTLS |
| **`EMAIL`** | `riturajsinghsveltose@gmail.com` | Outgoing system email address |
| **`PASSWORD`** | `nvldnelufybpkilw` | Google 16-character App Password |
| **`EMAIL_FROM`** | `MyBigBazaar <noreply@mybigbazaar.com>` | Sender header displayed in OTP emails |

### D. CORS Whitelist (`CORS_ORIGINS`)

The backend allows credentials with origins including:
- `https://backend.mybigbazaar.com`
- `https://superadmin.mybigbazaar.com`
- `https://mybigbazaar.com`
- `https://admin.mybigbazaar.com`
- `http://localhost:3000`, `http://localhost:5173`, `http://localhost:5174`, `http://localhost:8081`, `http://10.0.2.2:5000`
- Configured to wildcard fallback `*` in development mode.

---

## 3. Seed Credentials & Default Operational Accounts

Generated via `apps/api/seeds/seedAdmin.js`. All default roles are ready in the database:

| Role / Persona | Email Address | Cleartext Password | Assigned Permissions |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin@bigbazaar.com` | `Admin@123456` | Full platform authority, database moderation, role assignment, billing |
| **Safety Moderator** | `moderator@bigbazaar.com` | `Mod@123456` | Listing moderation, user suspension, KYC approvals, abuse queue |
| **Top Verified Seller** | `seller@bigbazaar.com` | `Seller@123456` | Listing creation, order fulfillment, store analytics, inventory |
| **Service Partner** | `provider@bigbazaar.com` | `Provider@123456` | Hyperlocal bookings, job status dispatch, service catalog management |
| **Regular Buyer** | `buyer@bigbazaar.com` | `Buyer@123456` | Product checkout, service booking, reviews, watchlist, chat |
| **Reviewer Test Account** | `prathamupadhyay127@gmail.com` | `123456` | Active administrative reviewer credentials |

---

## 4. Master API Endpoints Directory

> **Legend:**
> - <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> = Actively consumed by Mobile App, Admin Console, or Web Storefront.
> - `BACKEND ONLY` = Fully implemented in Express controller, available for automated workers, background crons, or upcoming sprint features.

---

### Module 1: Authentication & Identity Management

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/v1/auth/login`<br>`/auth/login` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Mobile, Web | Email/Password login. Returns JWT token and User model. |
| `POST` | `/api/v1/auth/signup`<br>`/auth/signup`<br>`/auth/register` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | New user registration with optional OTP trigger. |
| `POST` | `/api/v1/auth/check-email`<br>`/auth/check-email` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`authApi.js`) | Verifies if email already exists before registration. |
| `POST` | `/api/v1/auth/send-otp`<br>`/auth/send-otp` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`authApi.js`) | Sends 6-digit verification code to user email. |
| `POST` | `/api/v1/auth/verify-otp`<br>`/auth/verify-otp` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`authApi.js`) | Validates 6-digit OTP code against session/user record. |
| `POST` | `/api/v1/auth/resend-otp`<br>`/auth/resend-otp` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`authApi.js`) | Resends fresh verification OTP with rate limiting. |
| `POST` | `/api/v1/auth/send-phone-otp`<br>`/auth/send-phone-otp` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`PhoneLoginScreen`) | Generates SMS OTP for phone-based instant authentication. |
| `POST` | `/api/v1/auth/verify-phone-otp`<br>`/auth/verify-phone-otp` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`VerifyOtpScreen`) | Validates phone OTP and authenticates user. |
| `POST` | `/api/v1/auth/forgot-password`<br>`/auth/forgot-password` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Mobile, Web | Issues password reset OTP link to email. |
| `POST` | `/api/v1/auth/verify-forgot-password-otp` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Mobile | Validates reset OTP before password change. |
| `POST` | `/api/v1/auth/reset-password`<br>`/auth/reset-password` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Mobile, Web | Sets new password using validated reset token. |
| `POST` | `/api/v1/auth/google`<br>`/auth/google` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`authApi.js`), Web | OAuth Google sign-in payload exchange. |
| `GET` | `/api/v1/auth/me`<br>`/auth/me`<br>`/auth/profile` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Mobile, Web | Returns currently authenticated user profile & roles. |
| `PUT` | `/api/v1/auth/me` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Updates user profile name, phone, avatar, location. |
| `POST` | `/admin/login`<br>`/admin/signup` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Dedicated administrative authentication gateway. |

---

### Module 2: Products & Classified Listings

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/listings`<br>`/product/get-all`<br>`/products` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Admin, Web | Filterable product feed (`category`, `price`, `city`, `search`). |
| `GET` | `/api/v1/listings/:id`<br>`/product/get-by-id/:id`<br>`/product/get/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web, Admin | Product details by ID with populated seller info. |
| `POST` | `/api/v1/listings`<br>`/product/create` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`PostAdScreen`), Web, Admin | Post new ad with multipart/form-data image uploads. |
| `PUT` | `/api/v1/listings/:id`<br>`/product/update/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web, Admin | Updates listing attributes, pricing, or media. |
| `PATCH` | `/api/v1/listings/:id/status`<br>`/product/:id/status` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Changes ad status (`active`, `pending`, `sold`, `rejected`). |
| `DELETE` | `/api/v1/listings/:id`<br>`/product/delete/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Mobile, Web | Soft/hard delete listing by ID. |
| `POST` | `/api/v1/listings/:id/favorite` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`AppContext`), Web | Toggles item in buyer's favorites / watchlist. |
| `GET` | `/api/v1/listings/my/favorites` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`WatchlistScreen`), Web | Retrieves all favorited listings for authenticated user. |
| `GET` | `/api/v1/listings/my/all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`MyAdsScreen`), Web | Retrieves current seller's posted advertisements. |

---

### Module 3: Categories & Taxonomies

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/categories/products`<br>`/product-category/get-all`<br>`/category` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Admin, Web | Product category catalog with icon assets and slug mapping. |
| `POST` | `/api/v1/categories/products`<br>`/product-category/create` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Creates new product category with image upload. |
| `PUT` | `/api/v1/categories/products/:id`<br>`/product-category/update/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Updates category title, icon, order, or status. |
| `DELETE` | `/api/v1/categories/products/:id`<br>`/product-category/delete/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Deletes product category. |
| `GET` | `/api/v1/categories/products/sub/all`<br>`/product-subCategory/get-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Admin, Web | Product subcategories linked to parent category IDs. |
| `POST` | `/api/v1/categories/products/sub`<br>`/product-subCategory/create` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Creates child subcategory under parent category. |
| `PUT` | `/product-subCategory/update/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Updates subcategory details. |
| `DELETE` | `/product-subCategory/delete/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Deletes subcategory. |
| `GET` | `/api/v1/categories/services`<br>`/service-category/get-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Admin, Web | Hyperlocal service categories (Repair, Cleaning, Electrical, etc.). |
| `POST` | `/service-category/create` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Creates service category. |
| `PUT` | `/service-category/update/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Modifies service category. |
| `DELETE` | `/service-category/delete/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Deletes service category. |
| `GET` | `/service-sub-category/get-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Admin | Service child subcategories. |
| `GET` | `/api/v1/categories/taxonomy` | BACKEND ONLY | - | Full hierarchical nested taxonomy JSON tree. |

---

### Module 4: Hyperlocal Services & Bookings

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/services`<br>`/service/get-all`<br>`/services` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web, Admin | Active service catalog with pricing and provider ratings. |
| `GET` | `/api/v1/services/:id`<br>`/service/get-by-id/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web, Admin | Service details by ID including service areas & warranty. |
| `POST` | `/api/v1/services`<br>`/service/create` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Partner Portal | Registers a new provider service package. |
| `PUT` | `/api/v1/services/:id`<br>`/service/update/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Partner Portal | Edits existing service package pricing or terms. |
| `DELETE` | `/api/v1/services/:id`<br>`/service/delete/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Removes service offering. |
| `GET` | `/api/v1/bookings`<br>`/booking/get-all`<br>`/bookings` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Web, Mobile | All customer service bookings (filter by status). |
| `GET` | `/booking/get-by-user/:userId` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`BookingsScreen`) | Fetches all service appointments for a specific user ID. |
| `POST` | `/api/v1/bookings`<br>`/booking/create` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Creates service booking with date, slot, address, notes. |
| `PATCH` | `/api/v1/bookings/:id/status`<br>`/booking/update-status/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Updates booking status (`assigned`, `in_progress`, `completed`). |
| `POST` | `/api/v1/bookings/:id/cancel`<br>`/booking/:id/cancel` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Cancels scheduled booking with reason. |

---

### Module 5: Dynamic Seller Forms & Custom Attributes

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/seller-forms`<br>`/seller-form`<br>`/seller-forms` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Mobile | All category-specific custom field form definitions. |
| `GET` | `/api/v1/seller-forms/find?category=...`<br>`/api/v1/seller-forms/category/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`sellerFormApi.js`) | Fetches dynamic form fields (e.g. mileage, fuel, BHK, RAM). |
| `POST` | `/api/v1/seller-forms` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Admin creates form template for new categories. |
| `PUT` | `/api/v1/seller-forms` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Upserts dynamic attribute configuration. |
| `DELETE` | `/api/v1/seller-forms/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Deletes custom field form configuration. |

---

### Module 6: CMS, Banners, Media & Static Content

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/cms/banners`<br>`/banners/get-all`<br>`/banner` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`homeApi.js`), Admin | Active promotional & carousel banners with link destinations. |
| `GET` | `/api/v1/cms/banners?placement=...` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile Home/Services | Fetches banners filtered by placement tag. |
| `POST` | `/api/v1/cms/banners`<br>`/banners/create` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Uploads new promotional banner media & metadata. |
| `PUT` | `/api/v1/cms/banners/:id/status`<br>`/banners/:id/status` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Toggles banner visibility (`active` / `inactive`). |
| `PUT` | `/api/v1/cms/banners/update/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Modifies banner caption, redirect route, or priority. |
| `DELETE` | `/api/v1/cms/banners/delete/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Deletes banner record and static image file. |
| `GET` | `/api/v1/cms/banners/settings` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Admin | Returns carousel auto-scroll interval, dot styling, speed. |
| `PUT` | `/api/v1/cms/banners/settings` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Updates carousel animation behavior. |
| `POST` | `/api/v1/cms/banners/:id/track` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`trackBannerEventApi`) | Tracks banner impression or click count telemetry. |
| `GET` | `/api/v1/cms/gallery` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Gallery | Lists stored media assets in `/public/uploads`. |
| `GET` | `/logo/get-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`logoApi.js`), Web | Delivers primary, light, and dark brand logos. |
| `GET` | `/api/v1/cms/pages`<br>`/api/v1/cms/pages/:slug` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Web (`AboutPage`, `Terms`) | CMS rich-text pages (`about`, `privacy`, `terms`). |

---

### Module 7: Finance, Transactions, Wallets, Taxes & Invoices

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/transactions`<br>`/transactions`<br>`/transaction/get-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Ledger of all incoming payments & payouts. |
| `POST` | `/api/v1/transactions` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Records manual or offline transaction entry. |
| `GET` | `/api/v1/refunds`<br>`/refunds`<br>`/refund/get-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Refund requests queue (filter by status). |
| `POST` | `/api/v1/refunds/:id/approve` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Approves pending refund and credits buyer's wallet. |
| `POST` | `/api/v1/refunds/:id/reject` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Rejects refund request with reason. |
| `GET` | `/api/v1/taxes`<br>`/tax/get-all`<br>`/taxes` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Mobile (`taxApi.js`) | Platform tax rates (GST, CGST, SGST, IGST percentages). |
| `POST` | `/tax/create`<br>`/api/v1/taxes` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Adds new GST / service tax configuration. |
| `PUT` | `/tax/update/:id`<br>`/api/v1/taxes/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Modifies tax rate percentage or applicability rules. |
| `DELETE` | `/tax/delete/:id`<br>`/api/v1/taxes/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Deletes tax rule. |
| `GET` | `/api/v1/wallets`<br>`/wallets` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Mobile (`WalletScreen`) | Returns wallet balance & history for users. |
| `POST` | `/api/v1/wallets/adjust`<br>`/api/v1/wallets/topup` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Admin credit / debit adjustment to user wallet. |
| `POST` | `/api/v1/wallets/reset-all` | BACKEND ONLY | Admin Maintenance | Administrative zeroing utility for testing wallets. |
| `GET` | `/api/v1/invoices`<br>`/invoices` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | List of generated PDF invoices for orders & bookings. |
| `POST` | `/api/v1/coupons/validate` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`AppContext.jsx`) | Checks coupon validity and computes discount amount. |
| `GET` | `/coupon/get-all`<br>`/api/v1/coupons` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Promotional coupon codes and usage metrics. |
| `POST` | `/coupon/create`<br>`/api/v1/coupons` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Creates new promotional coupon with expiry & limits. |

---

### Module 8: KYC Verification & Service Provider Profiles

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/providers/kyc`<br>`/kyc/get-all`<br>`/kyc` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Pending and verified provider KYC submissions. |
| `PUT` | `/kyc/update/:id`<br>`/kyc/:id/status`<br>`/api/v1/admin/users/:id/kyc` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Sets KYC verification status (`verified`, `rejected`, `pending`). |
| `POST` | `/api/v1/kyc`<br>`/api/v1/services/kyc/submit` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`ProviderOnboardingScreen`), Web | Partner uploads Aadhaar, PAN, and Trade License docs. |
| `GET` | `/api/v1/providers`<br>`/provider/get-all`<br>`/providers` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console, Web | Directory of verified service providers and agencies. |
| `POST` | `/api/v1/providers/profile`<br>`/provider/profile` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Creates or updates provider business bio, areas, skills. |
| `PUT` | `/api/v1/providers/availability` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile Partner App | Sets provider online/offline duty status. |

---

### Module 9: E-Commerce Orders & Fulfillment

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/orders`<br>`/order/get-all`<br>`/orders` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin, Web, Mobile | Order list with buyer, seller, line items, and pricing. |
| `POST` | `/api/v1/orders`<br>`/order/create` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Web (`CartPage`), Mobile | Places purchase order for classified or store items. |
| `GET` | `/api/v1/orders/:id`<br>`/order/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Web, Mobile, Admin | Order tracking details, invoice data, and stage history. |
| `PUT` | `/api/v1/orders/:id/status`<br>`/order/:id/status` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Progresses order (`processing`, `shipped`, `delivered`). |
| `PUT` | `/api/v1/orders/:id/tracking`<br>`/order/:id/tracking` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Attaches courier tracking number and live tracker URL. |

---

### Module 10: In-App Chat, Messaging & Price Bargaining

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/chats/conversations`<br>`/api/v1/chat/conversations` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`ChatScreen`), Web | Active buyer-seller conversation threads. |
| `POST` | `/api/v1/chats/conversations` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Creates or initiates conversation linked to listing ID. |
| `GET` | `/api/v1/chats/conversations/:id/messages` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Historical messages in conversation thread. |
| `POST` | `/api/v1/chats/conversations/:id/messages` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Sends text message or photo attachment. |
| `POST` | `/api/v1/chats/messages/:id/offer` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Formal bargaining offer response (`accepted`, `declined`, `countered`). |
| `GET` | `/api/v1/chats/admin/conversations` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Administrative oversight for buyer/seller disputes. |

---

### Module 11: Support Tickets, Inquiries & Lead Management

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/v1/support/contact`<br>`/api/enquiries`<br>`/enquiries` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Web (`ContactPage`), Mobile | Submits support ticket or customer inquiry. |
| `GET` | `/api/v1/support/tickets/:ticketId` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Web (`TrackTicketPage`) | Retrieves resolution status for submitted ticket ID. |
| `GET` | `/api/v1/support/faqs` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Web, Mobile | Frequently Asked Questions database. |
| `GET` | `/api/v1/support/admin/tickets`<br>`/enquiries/get-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Admin inquiries & support ticket desk. |
| `PUT` | `/api/v1/support/admin/tickets/:ticketId`<br>`/enquiries/:id/status` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Updates ticket status (`open`, `in_progress`, `resolved`). |

---

### Module 12: Content Moderation & Abuse Reporting

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/v1/moderation/report`<br>`/moderation/report` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Reports suspicious ad, spam message, or rogue seller. |
| `GET` | `/api/v1/moderation/queue`<br>`/moderation/queue`<br>`/report/get-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Safety queue containing flagged user reports. |
| `PUT` | `/api/v1/moderation/reports/:id`<br>`/moderation/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Resolves or dismisses moderation ticket. |
| `PUT` | `/api/v1/moderation/users/:id/suspension` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Instantly freezes or unfreezes abusive user account. |

---

### Module 13: Push Notifications & Telemetry

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/notifications`<br>`/notification/get-all`<br>`/notifications` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Admin, Web | User alerts, booking notices, price drop triggers. |
| `GET` | `/api/v1/notifications/unread-count` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile Header Badge | Count of unread alerts for app notification badge. |
| `PUT` | `/api/v1/notifications/:id/read` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Marks single notification as read. |
| `PUT` | `/api/v1/notifications/read-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile, Web | Marks all notifications as read. |
| `POST` | `/api/v1/notifications/broadcast` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Broadcasts push notification to all registered users. |
| `POST` | `/api/v1/user/notification-permission` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`homeApi.js`) | Syncs FCM device push notification token to backend. |
| `GET` | `/api/v1/home/home-data` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Mobile (`homeApi.js`) | Aggregated mobile home payload (banners, pills, items). |

---

### Module 14: Administrative Management & System Health

| Method | Endpoint Route | Integration Status | Consumer Clients | Description & Payload |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard`<br>`/analytics/dashboard` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | High-level metrics: GMV, total users, ad counts, sales. |
| `GET` | `/api/v1/admin/users`<br>`/auth/get-all-users`<br>`/user/get-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Complete paginated user roster with roles and statuses. |
| `PUT` | `/api/v1/admin/users/:id/role`<br>`/api/v1/admin/users/:id/status` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Updates user operational role (`admin`, `moderator`, etc.). |
| `PUT` | `/api/v1/admin/users/bulk-status` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Bulk activation or deactivation of selected users. |
| `DELETE` | `/api/v1/admin/users/:id` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Hard delete user from database. |
| `GET` | `/audit-log/get-all` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | Admin Console | Immutable system audit log of administrative actions. |
| `GET` | `/health` | <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 6px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark> | DevOps / Uptime Kuma | Heartbeat check. Returns `{ success: true, status: 'healthy' }`. |

---

## 5. Live Backend Deployment & Troubleshooting (VPS `93.127.195.14`)

If `https://backend.mybigbazaar.com/health` returns `502 Bad Gateway`, follow these instructions on the VPS:

### Step 1: SSH into VPS
```bash
ssh root@93.127.195.14
```

### Step 2: Check Running PM2 Processes
```bash
pm2 status
pm2 logs api --lines 50
```

### Step 3: Check Internal Port 5000
```bash
curl -I http://127.0.0.1:5000/health
```

### Step 4: Restart or Boot the Unified API
```bash
cd /var/www/mybigbazaar/api # or current apps/api deployment path
npm install
node seeds/seedAdmin.js
pm2 restart api || pm2 start app.js --name "api"
```

### Step 5: Test MongoDB Atlas Connection
If logs report `MongooseServerSelectionError`:
1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com).
2. Go to **Network Access** → **IP Access List**.
3. Verify that `0.0.0.0/0` (Allow Access from Anywhere) or VPS IP `93.127.195.14` is active.

---
*Generated for the MyBigBazaar Engineering Team.*

# MyBigBazaar — Comprehensive Detailed API Data & Integration Specification

> **Technical Reference & API Contract Specification**  
> **Target Audience:** Backend Developers, Frontend Engineers (Mobile, Admin, Web), QA Engineers  
> **Yellow Highlighting Rule:** Every endpoint actively integrated with any frontend (`mobile`, `admin`, `web`) is tagged with <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>.

---

## 1. Developer Secrets, Host & Environment Quick-Sheet

| Key / Parameter | Production / Development Value | Description |
| :--- | :--- | :--- |
| **Server IP** | `93.127.195.14` | Hostinger Cloud VPS running Ubuntu & Nginx reverse proxy |
| **API Base URL** | `https://backend.mybigbazaar.com` | Production HTTPS Gateway (proxies to `127.0.0.1:5000`) |
| **Local Port** | `5000` (`http://localhost:5000`) | Internal Node.js / Express process port |
| **MongoDB Atlas URI** | `mongodb+srv://mybigbazaarindia_db_user:AmwKZh9aKkm9sVRK@cluster0.3ahhv3l.mongodb.net/bigbazaar?appName=Cluster0` | Primary replica-set database connection string |
| **DB Name** | `bigbazaar` | MongoDB database identifier |
| **Atlas Shards** | `ac-cmtetxn-shard-00-00.3ahhv3l.mongodb.net:27017`<br>`ac-cmtetxn-shard-00-01.3ahhv3l.mongodb.net:27017`<br>`ac-cmtetxn-shard-00-02.3ahhv3l.mongodb.net:27017` | Replica set cluster shard host addresses |
| **`JWT_SECRET`** | `mysecrect123` | Active token signing secret (fallback: `dev_jwt_secret_mybigbazaar_key_2026`) |
| **`JWT_EXPIRES_IN`**| `7d` | Valid token lifetime |
| **Email Host / Port** | `smtp.gmail.com` : `587` | Google STARTTLS mail delivery port |
| **Email Sender** | `riturajsinghsveltose@gmail.com` | Registered Google system sender account |
| **Email Password** | `nvldnelufybpkilw` | Google 16-character secure App Password |
| **Super Admin** | `admin@bigbazaar.com` / `Admin@123456` | Full platform super-admin privileges |
| **Moderator** | `moderator@bigbazaar.com` / `Mod@123456` | Safety moderation and KYC approval privileges |
| **Top Seller** | `seller@bigbazaar.com` / `Seller@123456` | Verified seller account for test listings |
| **Service Provider**| `provider@bigbazaar.com` / `Provider@123456`| Certified repair and service provider |
| **Buyer Persona** | `buyer@bigbazaar.com` / `Buyer@123456` | Default registered customer account |
| **Reviewer Test** | `prathamupadhyay127@gmail.com` / `123456` | Reviewer credential account |

---

## 2. API Master Architecture & Routing Conventions

1. **Dual Mount Architecture**: Every primary endpoint is mounted at `/api/v1/<domain>/*` and aliased at root legacy endpoints (`/auth/*`, `/product/*`, `/category/*`, `/booking/*`, `/tax/*`, `/kyc/*`, etc.) for seamless cross-client compatibility.
2. **Standard Authentication Header**:
   ```http
   Authorization: Bearer <jwt_token>
   ```
3. **Standard JSON Response Envelope**:
   ```json
   {
     "success": true,
     "status": true,
     "message": "Human-readable operation status description",
     "data": { ... }
   }
   ```
4. **Standard Error Envelope**:
   ```json
   {
     "success": false,
     "status": false,
     "message": "Detailed error explanation message",
     "code": "ERROR_CODE_STRING",
     "statusCode": 400
   }
   ```

---

## 3. Detailed Endpoint Data & Integration Catalog

---

### Module 1: Authentication & Identity Management

#### 1.1 POST `/api/v1/auth/login` & `/auth/login`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin Console (`admin/src/utils/api.js`), Mobile App (`mobile/src/services/authApi.js`), Web Storefront (`web/src/services/apiClient.js`)
- **Access / Middleware**: Public, `authLimiter`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `email` | String | Yes | User email address (case-insensitive) |
  | `password` | String | Yes | Cleartext user password |
- **Sample Request**:
  ```json
  {
    "email": "admin@bigbazaar.com",
    "password": "Admin@123456"
  }
  ```
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "status": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "671400e40291fc28aa8ef901",
      "fullName": "Platform Administrator",
      "email": "admin@bigbazaar.com",
      "phoneNumber": "+91 9876543210",
      "role": "admin",
      "userTypes": ["buyer", "seller", "admin"],
      "status": "active",
      "isEmailVerified": true,
      "isPhoneVerified": true,
      "walletBalance": 0
    },
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { ... }
    }
  }
  ```
- **Error Codes**: `400 Bad Request` (missing fields), `401 Unauthorized` (invalid password/email), `403 Forbidden` (account suspended).

---

#### 1.2 POST `/api/v1/auth/signup` & `/auth/signup` / `/auth/register`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile App (`mobile/src/services/authApi.js`), Web Storefront (`web/src/services/apiClient.js`)
- **Access / Middleware**: Public, `authLimiter`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `fullName` | String | Yes | Full name of the user |
  | `email` | String | Yes | Unique email address |
  | `password` | String | Yes | Minimum 6 characters |
  | `phoneNumber` / `phone` | String | Optional | 10-digit mobile number |
  | `userTypes` | Array | Optional | `["buyer"]`, `["seller"]`, etc. |
- **Sample Request**:
  ```json
  {
    "fullName": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "password": "Password@123",
    "phoneNumber": "9876543210",
    "userTypes": ["buyer", "seller"]
  }
  ```
- **Success Response (HTTP 201)**:
  ```json
  {
    "success": true,
    "status": true,
    "message": "Account created successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "671401f80291fc28aa8ef902",
      "fullName": "Aarav Sharma",
      "email": "aarav.sharma@example.com",
      "phoneNumber": "+919876543210",
      "role": "buyer",
      "userTypes": ["buyer", "seller"],
      "status": "active",
      "isEmailVerified": false
    }
  }
  ```
- **Error Codes**: `400 Bad Request` (password < 6 characters), `409 Conflict` (email already exists).

---

#### 1.3 POST `/api/v1/auth/check-email` & `/auth/check-email`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile App (`mobile/src/services/authApi.js` -> `EmailLoginScreen.jsx`)
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "exists": true,
    "message": "An account with this email exists"
  }
  ```

---

#### 1.4 POST `/api/v1/auth/send-phone-otp` & `/auth/send-phone-otp`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile App (`mobile/src/screens/auth/PhoneLoginScreen.jsx`)
- **Access**: Public, `authLimiter`
- **Request Body**:
  ```json
  {
    "phoneNumber": "9876543210"
  }
  ```
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "4-digit verification code sent via SMS",
    "phoneNumber": "9876543210",
    "data": {
      "phoneNumber": "9876543210",
      "debugOtp": "1234"
    }
  }
  ```

---

#### 1.5 POST `/api/v1/auth/verify-phone-otp` & `/auth/verify-phone-otp`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile App (`mobile/src/screens/auth/VerifyOtpScreen.jsx`)
- **Access**: Public, `authLimiter`
- **Request Body**:
  ```json
  {
    "phoneNumber": "9876543210",
    "otp": "1234"
  }
  ```
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "status": true,
    "message": "Mobile number verified successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "671401f80291fc28aa8ef902",
      "phoneNumber": "+919876543210",
      "isPhoneVerified": true,
      "role": "buyer"
    }
  }
  ```

---

#### 1.6 POST `/api/v1/auth/forgot-password` & `/auth/forgot-password`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin Console (`admin/src/pages/ForgotPassword.jsx`), Mobile App
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Password reset code sent to your email",
    "data": {
      "debugOtp": "5821"
    }
  }
  ```

---

#### 1.7 POST `/api/v1/auth/verify-forgot-password-otp`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin Console, Mobile App
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "5821"
  }
  ```
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Reset code verified successfully",
    "data": {
      "resetToken": "c928a3f81e099238f83018e...",
      "otpVerified": true
    }
  }
  ```

---

#### 1.8 POST `/api/v1/auth/reset-password` & `/auth/reset-password`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin Console, Mobile App, Web
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "resetToken": "c928a3f81e099238f83018e...",
    "newPassword": "NewSecurePassword@123"
  }
  ```
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "Password has been reset successfully. Please log in with your new password."
  }
  ```

---

#### 1.9 GET `/api/v1/auth/me` & `/auth/me` / `/auth/profile`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin Session Validator (`admin/src/utils/api.js`), Mobile App, Web
- **Access**: Authenticated (`Authorization: Bearer <token>`)
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "status": true,
    "user": {
      "_id": "671400e40291fc28aa8ef901",
      "fullName": "Platform Administrator",
      "email": "admin@bigbazaar.com",
      "role": "admin",
      "walletBalance": 0,
      "addresses": []
    }
  }
  ```

---

### Module 2: Products & Classified Listings

#### 2.1 GET `/api/v1/listings` & `/product/get-all` / `/products`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Home & Catalog (`mobile/src/services/productApi.js`), Admin Products (`admin/src/utils/api.js`), Web Catalog (`web/src/services/apiClient.js`)
- **Access**: Public / Optional Auth
- **Query Parameters**:
  | Param | Type | Description |
  | :--- | :--- | :--- |
  | `q` | String | Full-text keyword search across title, description, tags |
  | `category` | String | Category name filter (e.g. `Cars`, `Mobiles`, `Properties`) |
  | `categoryId` | ObjectId | MongoDB Category ID |
  | `subcategory` | String | Subcategory name filter |
  | `subCategoryId` | ObjectId | MongoDB Subcategory ID |
  | `minPrice` / `maxPrice`| Number | Range pricing filter in INR |
  | `condition` | String | `New`, `Used`, `Refurbished` |
  | `city` | String | Geo city name filter (e.g. `Indore`, `Mumbai`) |
  | `status` | String | `all`, `live`, `pending_moderation`, `sold`, `rejected` |
  | `sortBy` | String | `newest`, `price_asc`, `price_desc`, `popular`, `featured` |
  | `page` / `limit` | Number | Pagination (`page=1&limit=20`) |
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "status": true,
    "count": 12,
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3,
    "data": [
      {
        "_id": "67140b080291fc28aa8efa12",
        "id": "67140b080291fc28aa8efa12",
        "title": "Hyundai i20 Asta (O) 1.2 Petrol MT",
        "productName": "Hyundai i20 Asta (O) 1.2 Petrol MT",
        "description": "Single owner, immaculate condition, comprehensive insurance.",
        "price": 685000,
        "productPrice": 685000,
        "category": "Cars",
        "subcategory": "Cars",
        "condition": "Used",
        "status": "live",
        "images": [
          "/uploads/listings/i20-front.jpg",
          "/uploads/listings/i20-interior.jpg"
        ],
        "imageUrls": [
          "https://backend.mybigbazaar.com/uploads/listings/i20-front.jpg"
        ],
        "location": {
          "city": "Indore",
          "state": "Madhya Pradesh",
          "pincode": "452001"
        },
        "attributes": {
          "year": 2021,
          "kmDriven": 34000,
          "fuel": "Petrol",
          "transmission": "Manual",
          "owners": "1st"
        },
        "sellerId": {
          "_id": "671400e40291fc28aa8ef904",
          "fullName": "Top Verified Seller",
          "avatarUrl": "/uploads/avatars/seller.png"
        },
        "isFavorite": false,
        "views": 182,
        "createdAt": "2026-10-18T10:30:00.000Z"
      }
    ],
    "listings": [ ... ]
  }
  ```

---

#### 2.2 GET `/api/v1/listings/:id` & `/product/get-by-id/:id` / `/product/get/:id`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Product Detail (`ProductDetailScreen.jsx`), Web Listing Detail (`web/src/pages/ProductDetailPage.jsx`)
- **Access**: Public / Optional Auth
- **URL Parameters**: `:id` (24-character MongoDB ObjectId)
- **Success Response (HTTP 200)**: Returns listing object populated with seller details, verified badge, and boolean `isFavorite` computed for the requesting session.

---

#### 2.3 POST `/api/v1/listings` & `/product/create`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Post Ad Screen (`mobile/src/screens/post/PostAdScreen.jsx`), Web Post Ad (`web/src/pages/PostAdPage.jsx`), Admin Console
- **Access**: Authenticated / Optional Auth fallback
- **Encoding**: `multipart/form-data` OR `application/json`
- **Payload Parameters**:
  | Field | Type | Description |
  | :--- | :--- | :--- |
  | `title` / `productName` | String (Req) | Title of the advertisement |
  | `price` / `productPrice` | Number (Req) | Selling price in INR |
  | `description` | String | Comprehensive description of item |
  | `category` / `categoryId` | String/ID | Category classification |
  | `subcategory` / `subCategoryId` | String/ID | Child subcategory classification |
  | `condition` | String | `New`, `Used`, `Refurbished` |
  | `city`, `state`, `pincode` | String | Geo location attributes |
  | `attributes` / `dynamicData`| Object / JSON | Category dynamic attributes (e.g. `{"year":2022,"fuel":"Petrol"}`) |
  | `images` / `files` | Binary Files | Multi-file file upload (handled by `upload.any()`) |
  | `imageUrls` | Array | Pre-hosted image URLs |
- **Success Response (HTTP 201)**:
  ```json
  {
    "success": true,
    "status": true,
    "message": "Listing created successfully",
    "data": {
      "_id": "67140f800291fc28aa8efb50",
      "title": "Apple iPhone 14 Pro Max 256GB Deep Purple",
      "price": 82000,
      "status": "live",
      "category": "Mobiles",
      "images": ["/uploads/listing-1729381283.jpg"]
    }
  }
  ```

---

#### 2.4 PUT `/api/v1/listings/:id` & `/product/update/:id`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin Moderation, Mobile Edit Ad, Web
- **Payload**: Accepts updated fields (`price`, `title`, `description`, `status`, `attributes`).
- **Success Response (HTTP 200)**: Returns updated listing object.

---

#### 2.5 POST `/api/v1/listings/:id/favorite`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Watchlist (`mobile/src/context/AppContext.jsx`), Web Watchlist
- **Access**: Authenticated / Session Fallback
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "isFavorite": true,
    "message": "Added to watchlist"
  }
  ```

---

### Module 3: Categories & Taxonomies

#### 3.1 GET `/api/v1/categories/products` & `/product-category/get-all` / `/category`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Home Categories (`categoryApi.js`), Admin Category Manager, Web Storefront
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "count": 12,
    "data": [
      {
        "_id": "671400e40291fc28aa8ef910",
        "name": "Cars",
        "slug": "cars",
        "icon": "/uploads/categories/cars.png",
        "sortOrder": 1,
        "isActive": true,
        "commissionRate": 2.5
      },
      {
        "_id": "671400e40291fc28aa8ef911",
        "name": "Properties",
        "slug": "properties",
        "icon": "/uploads/categories/properties.png",
        "sortOrder": 2,
        "isActive": true,
        "commissionRate": 1.0
      },
      {
        "_id": "671400e40291fc28aa8ef912",
        "name": "Mobiles",
        "slug": "mobiles",
        "icon": "/uploads/categories/mobiles.png",
        "sortOrder": 3,
        "isActive": true,
        "commissionRate": 3.0
      }
    ]
  }
  ```

---

#### 3.2 GET `/api/v1/categories/products/sub/all` & `/product-subCategory/get-all`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Subcategory Screen, Admin Subcategory Roster, Web Cascading Dropdown
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "count": 35,
    "data": [
      {
        "_id": "671400e40291fc28aa8ef930",
        "name": "Mobile Phones",
        "categoryId": "671400e40291fc28aa8ef912",
        "categoryName": "Mobiles",
        "isActive": true
      },
      {
        "_id": "671400e40291fc28aa8ef931",
        "name": "Accessories",
        "categoryId": "671400e40291fc28aa8ef912",
        "categoryName": "Mobiles",
        "isActive": true
      },
      {
        "_id": "671400e40291fc28aa8ef932",
        "name": "Tablets",
        "categoryId": "671400e40291fc28aa8ef912",
        "categoryName": "Mobiles",
        "isActive": true
      }
    ]
  }
  ```

---

#### 3.3 GET `/api/v1/categories/services` & `/service-category/get-all`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Services Tab (`mobile/src/services/categoryApi.js`), Admin Service Categories
- **Success Response (HTTP 200)**: Returns all hyperlocal service categories (`Appliance Repair`, `Home Cleaning`, `Electrician`, `Plumbing`, `Carpentry`, `Pest Control`).

---

### Module 4: Hyperlocal Services & Bookings

#### 4.1 GET `/api/v1/services` & `/service/get-all` / `/services`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Services Screen (`ServicesScreen.jsx`), Web Services (`web/src/pages/ServicesPage.jsx`), Admin Services Roster
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "status": true,
    "count": 8,
    "data": [
      {
        "_id": "671410200291fc28aa8efc01",
        "title": "Split AC Deep Jet Cleaning & Service",
        "category": "Appliance Repair",
        "price": 599,
        "rating": 4.88,
        "reviewsCount": 142,
        "provider": {
          "businessName": "Kottayam Express Services & Repair",
          "rating": 4.9,
          "isVerified": true
        },
        "serviceAreas": ["Kottayam", "Changanassery", "Pala"],
        "duration": "45 Mins",
        "warranty": "30 Days Service Warranty"
      }
    ]
  }
  ```

---

#### 4.2 POST `/api/v1/bookings` & `/booking/create`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Service Booking (`ServiceBookingScreen.jsx`), Web Checkout
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "serviceId": "671410200291fc28aa8efc01",
    "customer": {
      "fullName": "Aarav Sharma",
      "phone": "+91 9876543210",
      "email": "aarav.sharma@example.com"
    },
    "serviceAddress": {
      "houseNo": "Flat 402, Sunshine Heights",
      "street": "Collectorate Road",
      "city": "Kottayam",
      "state": "Kerala",
      "pincode": "686001"
    },
    "scheduledDate": "2026-10-24T10:00:00.000Z",
    "scheduledTimeSlot": "10:00 AM - 12:00 PM",
    "pricing": {
      "baseAmount": 599,
      "taxAmount": 107.82,
      "discount": 50,
      "totalAmount": 656.82
    },
    "paymentMode": "Cash on Delivery",
    "notes": "Please call before arriving."
  }
  ```
- **Success Response (HTTP 201)**:
  ```json
  {
    "success": true,
    "status": true,
    "message": "Booking confirmed successfully",
    "data": {
      "_id": "671412080291fc28aa8efc99",
      "bookingId": "BKG-882194",
      "status": "confirmed",
      "scheduledDate": "2026-10-24T10:00:00.000Z",
      "scheduledTimeSlot": "10:00 AM - 12:00 PM",
      "totalAmount": 656.82
    }
  }
  ```

---

#### 4.3 GET `/booking/get-by-user/:userId` & `/api/v1/bookings`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Bookings Screen (`BookingsScreen.jsx`), Admin Bookings Table
- **URL Parameter**: `:userId` (User ObjectId)
- **Success Response (HTTP 200)**: Returns user's active, in-progress, and past completed service appointments.

---

### Module 5: Dynamic Seller Forms & Custom Attributes

#### 5.1 GET `/api/v1/seller-forms/find?category=...`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Post Ad Dynamic Form Builder (`mobile/src/services/sellerFormApi.js`), Admin Form Configurator
- **Query Parameters**: `category` (e.g. `Cars`, `Properties`, `Mobiles`, `Bikes`)
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "status": true,
    "data": {
      "category": "Cars",
      "title": "Include some details",
      "fields": [
        {
          "id": "f_car_bmv",
          "key": "brandModelVariant",
          "label": "Brand",
          "type": "brand_model_variant",
          "placeholder": "Brand *",
          "required": true,
          "order": 1
        },
        {
          "id": "f_car_year",
          "key": "year",
          "label": "Year",
          "type": "number",
          "placeholder": "Year *",
          "required": true,
          "maxLength": 4,
          "minValue": 1900,
          "order": 2
        },
        {
          "id": "f_car_fuel",
          "key": "fuel",
          "label": "Fuel",
          "type": "select",
          "placeholder": "Fuel *",
          "options": ["CNG & Hybrids", "Diesel", "Electric", "LPG", "Petrol"],
          "required": true,
          "order": 3
        },
        {
          "id": "f_car_kmDriven",
          "key": "kmDriven",
          "label": "KM driven",
          "type": "number",
          "placeholder": "KM driven *",
          "required": true,
          "maxLength": 6,
          "order": 4
        }
      ]
    }
  }
  ```

---

### Module 6: CMS, Banners, Media & Static Content

#### 6.1 GET `/api/v1/cms/banners` & `/banners/get-all` / `/banner`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Home Carousel (`mobile/src/services/homeApi.js`), Admin Banner Management (`admin/src/utils/api.js`)
- **Query Parameters**: `placement` (`home_hero`, `onboarding`, `services`, `promotions`), `all=true`
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "status": true,
    "count": 3,
    "data": [
      {
        "_id": "671415080291fc28aa8efd10",
        "id": "671415080291fc28aa8efd10",
        "title": "Mega Diwali Electronics Bonanza",
        "subtitle": "Up to 60% off on Mobiles, Laptops & Appliances",
        "imageUrl": "https://backend.mybigbazaar.com/uploads/banners/diwali-banner.png",
        "linkUrl": "/products?category=Electronics",
        "targetScreen": "ProductList",
        "placement": "home_hero",
        "sortOrder": 1,
        "isActive": true
      }
    ]
  }
  ```

---

#### 6.2 GET `/logo/get-all`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile App Header (`mobile/src/services/logoApi.js`), Web Header / Footer
- **Success Response (HTTP 200)**:
  ```json
  {
    "status": true,
    "success": true,
    "logo": {
      "logo": "/uploads/client-logo-header.png",
      "lightLogo": "/uploads/client-logo-purewhite.png",
      "darkLogo": "/uploads/client-logo-header.png"
    }
  }
  ```

---

### Module 7: Finance, Transactions, Wallets, Taxes & Invoices

#### 7.1 GET `/api/v1/transactions` & `/transactions` / `/transaction/get-all`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin Transactions Panel (`admin/src/utils/api.js`)
- **Access**: Admin Authenticated
- **Query Parameters**: `status` (`Success`, `Pending`, `Failed`), `paymentMode` (`UPI`, `Card`, `NetBanking`, `Cash on Delivery`)
- **Success Response (HTTP 200)**: Returns formatted transaction ledger records synthesized from Payment and Order models.

---

#### 7.2 GET `/api/v1/taxes` & `/tax/get-all` / `/taxes`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Tax Calculation (`mobile/src/services/taxApi.js`), Admin Taxes Roster
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "671400e40291fc28aa8ef960",
        "taxName": "Standard GST",
        "taxRate": 18,
        "taxType": "percentage",
        "description": "Standard Good & Service Tax (CGST 9% + SGST 9%)",
        "isActive": true
      }
    ]
  }
  ```

---

#### 7.3 GET `/api/v1/wallets` & `/wallets`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Wallet (`mobile/src/screens/profile/WalletScreen.jsx`), Admin Console
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "data": {
      "walletBalance": 0,
      "currency": "INR",
      "transactions": []
    }
  }
  ```

---

#### 7.4 POST `/api/v1/coupons/validate`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile App Cart / Checkout (`AppContext.jsx`)
- **Request Body**:
  ```json
  {
    "code": "FESTIVE10",
    "orderAmount": 1500
  }
  ```
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "valid": true,
    "discountAmount": 150,
    "finalAmount": 1350,
    "message": "Coupon FESTIVE10 applied! You saved ₹150."
  }
  ```

---

### Module 8: KYC Verification & Service Provider Profiles

#### 8.1 GET `/api/v1/providers/kyc` & `/kyc/get-all` / `/kyc`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin KYC Verification Desk (`admin/src/utils/api.js`)
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "count": 4,
    "data": [
      {
        "_id": "671418200291fc28aa8efe01",
        "partnerName": "Rajesh Kumar",
        "businessName": "Express AC & Electricals",
        "docType": "Aadhaar Card",
        "docNumber": "XXXX-XXXX-4812",
        "status": "pending",
        "submittedAt": "2026-10-19T08:15:00.000Z"
      }
    ]
  }
  ```

---

#### 8.2 PUT `/kyc/update/:id` & `/kyc/:id/status` / `/api/v1/admin/users/:id/kyc`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin KYC Approvals
- **Request Body**:
  ```json
  {
    "status": "verified",
    "remarks": "Documents verified against NSDL portal."
  }
  ```
- **Success Response (HTTP 200)**: Returns confirmation that KYC status was updated to `verified`.

---

### Module 9: E-Commerce Orders & Fulfillment

#### 9.1 GET `/api/v1/orders` & `/order/get-all` / `/orders`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin Orders Table (`admin/src/utils/api.js`), Web Order History (`web/src/pages/OrdersPage.jsx`)
- **Success Response (HTTP 200)**: Returns paginated order list with line items, tracking stage (`Ordered`, `Packed`, `Shipped`, `Out for Delivery`, `Delivered`), and invoices.

---

#### 9.2 POST `/api/v1/orders` & `/order/create`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Web Cart Checkout (`CartPage.jsx`), Mobile Checkout
- **Request Body**: Takes items array, shipping address, payment mode, tax details.
- **Success Response (HTTP 201)**: Returns created Order document with unique `orderNumber` (`ORD-202610-101`).

---

### Module 10: In-App Chat, Messaging & Bargaining

#### 10.1 GET `/api/v1/chats/conversations` & `/api/v1/chat/conversations`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile In-App Chat (`mobile/src/screens/chat/ChatScreen.jsx`), Web Chat
- **Success Response (HTTP 200)**: Returns active conversation list with unread counter and last message preview.

---

#### 10.2 POST `/api/v1/chats/messages/:id/offer`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Bargaining UI, Web Chat Offer Modal
- **Request Body**:
  ```json
  {
    "action": "accept"
  }
  ```
- **Success Response (HTTP 200)**: Returns updated offer state (`accepted`, `rejected`, or `countered` with new offer price).

---

### Module 11: Support Tickets & Contact Inquiries

#### 11.1 POST `/api/v1/support/contact` & `/api/enquiries` / `/enquiries`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Web Support / Contact Us (`web/src/pages/ContactPage.jsx`), Mobile Helpdesk
- **Request Body**:
  ```json
  {
    "name": "Pratham Upadhyay",
    "email": "pratham@example.com",
    "phone": "+91 9876543210",
    "subject": "Delivery Inquiry",
    "category": "order_support",
    "message": "When will order #ORD-202610-101 be dispatched?"
  }
  ```
- **Success Response (HTTP 201)**:
  ```json
  {
    "success": true,
    "message": "Your inquiry has been submitted successfully.",
    "data": {
      "ticketId": "TKT-M8J29L-4182",
      "status": "open",
      "createdAt": "2026-10-19T14:20:00.000Z"
    }
  }
  ```

---

#### 11.2 GET `/api/v1/support/tickets/:ticketId`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Web Ticket Tracker (`web/src/pages/TrackTicketPage.jsx`)
- **Success Response (HTTP 200)**: Returns ticket resolution note and current operational status (`open`, `in_progress`, `resolved`).

---

### Module 12: Content Moderation & Safety

#### 12.1 POST `/api/v1/moderation/report` & `/moderation/report`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile Report Ad / User Modal, Web Storefront
- **Request Body**:
  ```json
  {
    "targetType": "listing",
    "targetId": "67140b080291fc28aa8efa12",
    "reason": "Suspicious / Misleading Price",
    "description": "Seller asked for advance token payment outside the platform."
  }
  ```
- **Success Response (HTTP 201)**: Returns 201 `{ success: true, message: "Report submitted successfully." }`.

---

#### 12.2 GET `/api/v1/moderation/queue` & `/report/get-all`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin Moderation Desk (`admin/src/utils/api.js`)
- **Success Response (HTTP 200)**: Returns active abuse queue with reporter details and flagged entity info.

---

### Module 13: Push Notifications & Telemetry

#### 13.1 GET `/api/v1/home/home-data`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile App Home Screen (`mobile/src/services/homeApi.js`)
- **Success Response (HTTP 200)**: Aggregates active hero banners, category pills, top nearby services, and trending marketplace products in a single high-performance round-trip.

---

#### 13.2 POST `/api/v1/user/notification-permission`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Mobile App FCM Push Registration (`mobile/src/services/homeApi.js`)
- **Request Body**:
  ```json
  {
    "granted": true,
    "pushToken": "fcm_device_token_xyz"
  }
  ```
- **Success Response (HTTP 200)**: Returns `{ success: true, message: "Notifications enabled successfully" }`.

---

### Module 14: System Administration & Health

#### 14.1 GET `/api/v1/admin/dashboard` & `/analytics/dashboard`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Admin Console Overview Dashboard (`admin/src/utils/api.js`)
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "status": true,
    "data": {
      "stats": {
        "totalUsers": 128,
        "activeListings": 45,
        "totalBookings": 18,
        "totalRevenue": 248500
      }
    }
  }
  ```

---

#### 14.2 GET `/health`
- **Integration Status**: <mark style="background-color: #FEF08A; color: #713F12; padding: 2px 7px; border-radius: 4px; font-weight: bold;">INTEGRATED</mark>
- **Frontend Clients**: Server Uptime Monitoring, DevOps Health Checker
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "status": "healthy",
    "service": "MyBigBazaar Unified API",
    "version": "1.0.0",
    "timestamp": "2026-10-22T09:48:00.000Z"
  }
  ```

---
*Generated for the MyBigBazaar Engineering Team.*

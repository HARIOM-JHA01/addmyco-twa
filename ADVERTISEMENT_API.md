# Advertisement API Documentation

Base URL: `/api/v1`

## Table of Contents

1. [User Endpoints](#user-endpoints)
2. [Public Endpoints](#public-endpoints)
3. [Admin Endpoints](#admin-endpoints)

---

## User Endpoints

All user endpoints require authentication via `isUser` middleware.

### Get Active Packages
**GET** `/advertisement/packages`

Get all active advertisement packages, optionally filtered by position.

**Query Parameters:**
- `position` (optional): Filter packages by position (e.g., `HOME_BANNER`, `BOTTOM_CIRCLE`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "package_id",
      "name": "Premium Package",
      "description": "Description text",
      "displayCredits": 1000,
      "priceUSDT": 50,
      "positions": ["HOME_BANNER"],
      "duration": null,
      "isActive": true,
      "createdAt": "2026-01-06T10:00:00Z",
      "updatedAt": "2026-01-06T10:00:00Z"
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

### Get User's Credit Balance
**GET** `/advertisement/my-credits`

Get the current user's advertisement credit balance.

**Headers:**
- `Authorization`: Required (User token)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "credits_id",
    "userId": "user_id",
    "totalCredits": 5000,
    "usedCredits": 1200,
    "availableCredits": 3800,
    "createdAt": "2026-01-06T10:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

---

### Buy Credits
**POST** `/advertisement/buy-credits`

Initiate a payment to purchase advertisement credits.

**Headers:**
- `Authorization`: Required (User token)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "amount": 50,
  "currency": "USDT",
  "paymentMethod": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_123456",
    "amount": 50,
    "credits": 1000,
    "status": "pending",
    "paymentUrl": "https://payment.provider.com/pay/txn_123456"
  }
}
```

**Status Codes:**
- `200`: Payment initiated
- `400`: Invalid request
- `401`: Unauthorized
- `500`: Server error

---

### Verify Payment and Add Credits
**POST** `/advertisement/verify-payment`

Verify a payment and add credits to user's account.

**Headers:**
- `Authorization`: Required (User token)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "transactionId": "txn_123456",
  "paymentProof": "payment_proof_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "credits": {
      "totalCredits": 6000,
      "usedCredits": 1200,
      "availableCredits": 4800
    },
    "transaction": {
      "_id": "transaction_id",
      "status": "completed",
      "amount": 50,
      "creditsAdded": 1000
    }
  }
}
```

**Status Codes:**
- `200`: Payment verified
- `400`: Invalid payment
- `401`: Unauthorized
- `500`: Server error

---

### Create New Advertisement
**POST** `/advertisement/create`

Create a new advertisement.

**Headers:**
- `Authorization`: Required (User token)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "title": "Product Advertisement",
  "description": "Long description of the ad",
  "position": "HOME_BANNER",
  "country": "US",
  "credits": 100,
  "targetUrl": "https://example.com",
  "imageUrl": "https://cdn.example.com/image.jpg",
  "startDate": "2026-01-07T00:00:00Z",
  "endDate": "2026-02-07T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ad_id",
    "sponsorId": "user_id",
    "title": "Product Advertisement",
    "description": "Long description",
    "position": "HOME_BANNER",
    "country": "US",
    "credits": 100,
    "targetUrl": "https://example.com",
    "imageUrl": "https://cdn.example.com/image.jpg",
    "status": "pending",
    "approvalStatus": "pending",
    "createdAt": "2026-01-06T10:00:00Z"
  }
}
```

**Status Codes:**
- `201`: Advertisement created
- `400`: Invalid request
- `401`: Unauthorized
- `500`: Server error

---

### Get User's Advertisements
**GET** `/advertisement/my-ads`

Get all advertisements created by the current user.

**Headers:**
- `Authorization`: Required (User token)

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `paused`, `ended`)
- `approvalStatus` (optional): Filter by approval status (`pending`, `approved`, `rejected`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ad_id",
      "title": "Product Advertisement",
      "status": "active",
      "approvalStatus": "approved",
      "credits": 100,
      "impressions": 1234,
      "clicks": 45,
      "createdAt": "2026-01-06T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

---

### Pause Advertisement
**PATCH** `/advertisement/:id/pause`

Pause an active advertisement.

**Headers:**
- `Authorization`: Required (User token)
- `Content-Type`: application/json

**URL Parameters:**
- `id` (required): Advertisement ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ad_id",
    "title": "Product Advertisement",
    "status": "paused",
    "updatedAt": "2026-01-06T11:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Advertisement paused
- `404`: Advertisement not found
- `401`: Unauthorized
- `500`: Server error

---

### Resume Advertisement
**PATCH** `/advertisement/:id/resume`

Resume a paused advertisement.

**Headers:**
- `Authorization`: Required (User token)
- `Content-Type`: application/json

**URL Parameters:**
- `id` (required): Advertisement ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ad_id",
    "title": "Product Advertisement",
    "status": "active",
    "updatedAt": "2026-01-06T11:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Advertisement resumed
- `404`: Advertisement not found
- `401`: Unauthorized
- `500`: Server error

---

### Delete Advertisement
**DELETE** `/advertisement/:id`

Delete an advertisement.

**Headers:**
- `Authorization`: Required (User token)

**URL Parameters:**
- `id` (required): Advertisement ID

**Response:**
```json
{
  "success": true,
  "message": "Advertisement deleted successfully",
  "data": {
    "_id": "ad_id"
  }
}
```

**Status Codes:**
- `200`: Advertisement deleted
- `404`: Advertisement not found
- `401`: Unauthorized
- `500`: Server error

---

## Public Endpoints

No authentication required for these endpoints.

### Get Active Advertisements
**GET** `/advertisement/active`

Get all active advertisements for display on the platform.

**Query Parameters:**
- `position` (optional): Filter by position
- `country` (optional): Filter by country
- `limit` (optional): Number of ads to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ad_id",
      "title": "Product Advertisement",
      "description": "Advertisement description",
      "imageUrl": "https://cdn.example.com/image.jpg",
      "targetUrl": "https://example.com",
      "position": "HOME_BANNER",
      "impressions": 1234,
      "clicks": 45
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

### Track Advertisement Display/Impression
**POST** `/advertisement/:id/track-display`

Track when an advertisement is displayed to a user.

**URL Parameters:**
- `id` (required): Advertisement ID

**Request Body:**
```json
{
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "referrer": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Display tracked successfully",
  "data": {
    "advertisementId": "ad_id",
    "displayCount": 1235
  }
}
```

**Status Codes:**
- `200`: Display tracked
- `404`: Advertisement not found
- `500`: Server error

---

### Track Advertisement Click
**POST** `/advertisement/:id/track-click`

Track when a user clicks on an advertisement.

**URL Parameters:**
- `id` (required): Advertisement ID

**Request Body:**
```json
{
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Click tracked successfully",
  "data": {
    "advertisementId": "ad_id",
    "clickCount": 46
  }
}
```

**Status Codes:**
- `200`: Click tracked
- `404`: Advertisement not found
- `500`: Server error

---

## Admin Endpoints

All admin endpoints require authentication via `isAdmin` middleware.

### Get All Packages
**GET** `/admin/advertisement/packages`

Get all advertisement packages (active and inactive).

**Headers:**
- `Authorization`: Required (Admin token)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "package_id",
      "name": "Premium Package",
      "description": "Description text",
      "displayCredits": 1000,
      "priceUSDT": 50,
      "positions": ["HOME_BANNER"],
      "duration": null,
      "isActive": true,
      "createdAt": "2026-01-06T10:00:00Z"
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

---

### Get Single Package
**GET** `/admin/advertisement/packages/:id`

Get details of a specific advertisement package.

**Headers:**
- `Authorization`: Required (Admin token)

**URL Parameters:**
- `id` (required): Package ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "package_id",
    "name": "Premium Package",
    "description": "Description text",
    "displayCredits": 1000,
    "priceUSDT": 50,
    "positions": ["HOME_BANNER"],
    "duration": null,
    "isActive": true,
    "createdAt": "2026-01-06T10:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Package not found
- `401`: Unauthorized
- `500`: Server error

---

### Create Package
**POST** `/admin/advertisement/packages`

Create a new advertisement package.

**Headers:**
- `Authorization`: Required (Admin token)
- `Content-Type`: application/json

**Request Body:**
```json
{
  "name": "Premium Package",
  "description": "Premium advertisement package",
  "displayCredits": 1000,
  "priceUSDT": 50,
  "positions": ["HOME_BANNER"],
  "duration": null,
  "isActive": true
}
```

**Validation Rules:**
- `name`: Required, string, 3-50 characters, must be unique
- `displayCredits`: Required, numeric, minimum 1
- `priceUSDT`: Required, numeric, minimum 0
- `positions`: Required, array of valid positions

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "package_id",
    "name": "Premium Package",
    "displayCredits": 1000,
    "priceUSDT": 50,
    "positions": ["HOME_BANNER"],
    "isActive": true,
    "createdAt": "2026-01-06T10:00:00Z"
  }
}
```

**Status Codes:**
- `201`: Package created
- `400`: Invalid request or validation error
- `401`: Unauthorized
- `500`: Server error

---

### Update Package
**PATCH** `/admin/advertisement/packages/:id`

Update an existing advertisement package.

**Headers:**
- `Authorization`: Required (Admin token)
- `Content-Type`: application/json

**URL Parameters:**
- `id` (required): Package ID

**Request Body:**
```json
{
  "name": "Updated Package Name",
  "description": "Updated description",
  "displayCredits": 2000,
  "priceUSDT": 75,
  "positions": ["HOME_BANNER", "BOTTOM_CIRCLE"],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "package_id",
    "name": "Updated Package Name",
    "displayCredits": 2000,
    "priceUSDT": 75,
    "positions": ["HOME_BANNER", "BOTTOM_CIRCLE"],
    "isActive": true,
    "updatedAt": "2026-01-06T11:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Package updated
- `404`: Package not found
- `400`: Invalid request
- `401`: Unauthorized
- `500`: Server error

---

### Toggle Package Active Status
**PATCH** `/admin/advertisement/packages/:id/toggle`

Toggle the active/inactive status of a package.

**Headers:**
- `Authorization`: Required (Admin token)
- `Content-Type`: application/json

**URL Parameters:**
- `id` (required): Package ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "package_id",
    "name": "Premium Package",
    "isActive": false,
    "updatedAt": "2026-01-06T11:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Status toggled
- `404`: Package not found
- `401`: Unauthorized
- `500`: Server error

---

### Delete Package
**DELETE** `/admin/advertisement/packages/:id`

Delete an advertisement package.

**Headers:**
- `Authorization`: Required (Admin token)

**URL Parameters:**
- `id` (required): Package ID

**Response:**
```json
{
  "success": true,
  "message": "Package deleted successfully",
  "data": {
    "_id": "package_id"
  }
}
```

**Status Codes:**
- `200`: Package deleted
- `404`: Package not found
- `401`: Unauthorized
- `500`: Server error

---

### Get All Advertisements
**GET** `/admin/advertisement/all`

Get all advertisements with optional filters.

**Headers:**
- `Authorization`: Required (Admin token)

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `paused`, `ended`)
- `approvalStatus` (optional): Filter by approval status (`pending`, `approved`, `rejected`)
- `position` (optional): Filter by position
- `country` (optional): Filter by country
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ad_id",
      "title": "Product Advertisement",
      "sponsorId": {
        "_id": "sponsor_id",
        "firstname": "John",
        "lastname": "Doe",
        "email": "john@example.com"
      },
      "status": "active",
      "approvalStatus": "approved",
      "position": "HOME_BANNER",
      "country": "US",
      "credits": 100,
      "impressions": 1234,
      "clicks": 45,
      "createdAt": "2026-01-06T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

---

### Approve Advertisement
**PATCH** `/admin/advertisement/:id/approve`

Approve a pending advertisement.

**Headers:**
- `Authorization`: Required (Admin token)
- `Content-Type`: application/json

**URL Parameters:**
- `id` (required): Advertisement ID

**Request Body:**
```json
{
  "notes": "Approved - meets all requirements"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ad_id",
    "title": "Product Advertisement",
    "approvalStatus": "approved",
    "approvedAt": "2026-01-06T11:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Advertisement approved
- `404`: Advertisement not found
- `401`: Unauthorized
- `500`: Server error

---

### Reject Advertisement
**PATCH** `/admin/advertisement/:id/reject`

Reject a pending advertisement.

**Headers:**
- `Authorization`: Required (Admin token)
- `Content-Type`: application/json

**URL Parameters:**
- `id` (required): Advertisement ID

**Request Body:**
```json
{
  "reason": "Does not meet platform guidelines",
  "notes": "Contains inappropriate content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ad_id",
    "title": "Product Advertisement",
    "approvalStatus": "rejected",
    "rejectionReason": "Does not meet platform guidelines",
    "rejectedAt": "2026-01-06T11:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Advertisement rejected
- `404`: Advertisement not found
- `401`: Unauthorized
- `500`: Server error

---

### Get Analytics
**GET** `/admin/advertisement/analytics`

Get advertisement analytics and statistics.

**Headers:**
- `Authorization`: Required (Admin token)

**Query Parameters:**
- `startDate` (optional): Start date for analytics (ISO 8601)
- `endDate` (optional): End date for analytics (ISO 8601)
- `position` (optional): Filter by position
- `country` (optional): Filter by country

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAdvertisements": 150,
    "activeAdvertisements": 45,
    "totalImpressions": 125000,
    "totalClicks": 3500,
    "averageCTR": 2.8,
    "topPerformingAds": [
      {
        "_id": "ad_id",
        "title": "Product Advertisement",
        "impressions": 5000,
        "clicks": 200,
        "ctr": 4.0
      }
    ],
    "byPosition": {
      "HOME_BANNER": {
        "ads": 30,
        "impressions": 75000,
        "clicks": 2100
      }
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

---

### Get Sponsor Details
**GET** `/admin/sponsor/:sponsorId/details`

Get detailed information about a sponsor/user.

**Headers:**
- `Authorization`: Required (Admin token)

**URL Parameters:**
- `sponsorId` (required): User/Sponsor ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "tgid": "telegram_id",
    "totalAdvertisements": 15,
    "activeAdvertisements": 8,
    "credits": {
      "totalCredits": 5000,
      "usedCredits": 2000,
      "availableCredits": 3000
    },
    "statistics": {
      "totalImpressions": 50000,
      "totalClicks": 1500,
      "averageCTR": 3.0
    },
    "createdAt": "2025-06-01T10:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Sponsor not found
- `401`: Unauthorized
- `500`: Server error

---

## Position Types

Valid position types for advertisements:

- `HOME_BANNER` - Home page banner advertisement
- `BOTTOM_CIRCLE` - Bottom circular advertisement
- `SIDEBAR` - Sidebar advertisement
- `FOOTER` - Footer advertisement

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (optional)",
  "errors": {
    "fieldName": "Validation error message"
  }
}
```

**Common Error Codes:**

| Code | Status | Meaning |
|------|--------|---------|
| 400 | Bad Request | Invalid request parameters or validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## Authentication

Authentication is handled via middleware:

- **User Authentication**: `isUser` middleware - Required for user endpoints
- **Admin Authentication**: `isAdmin` middleware - Required for admin endpoints

Include the authentication token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Rate Limiting

Current implementation does not have rate limiting. Consider implementing rate limiting for production use.

---

## Pagination

Endpoints that support pagination use the following format:

**Query Parameters:**
- `page`: Page number (1-indexed, default: 1)
- `limit`: Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

---

## Last Updated

January 6, 2026

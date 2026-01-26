# Advertisement Statistics API Documentation

## Overview

The Advertisement Statistics API provides detailed performance metrics and view analytics for individual advertisements. Users can track where their ads are being viewed (by country), when they are viewed (by date and time), and comprehensive click-through rate (CTR) data.

---

## Endpoints

### 1. Get Individual Ad Statistics

**Endpoint:** `GET /api/v1/advertisement/:id/stats`

**Description:** Retrieves detailed statistics for a specific advertisement including views grouped by country, date, and time.

**Authentication:** Required (User token)

**Request Headers:**

```
Authorization: Bearer {user_token}
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|--------|----------|--------------------------|
| id | String | Yes | Advertisement ID (MongoDB ObjectId) |

**Query Parameters:** None

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "advertisementId": "507f1f77bcf86cd799439011",
    "position": "HOME_BANNER",
    "country": "US",
    "status": "ACTIVE",
    "totalViews": 1250,
    "totalClicks": 85,
    "ctrPercentage": 6.8,
    "summary": {
      "viewsByCountry": {
        "US": 450,
        "UK": 380,
        "CA": 210,
        "IN": 180,
        "Unknown": 30
      },
      "viewsByDate": {
        "2026-01-20": 350,
        "2026-01-19": 420,
        "2026-01-18": 480
      },
      "viewsByTime": {
        "00:00": 45,
        "01:00": 38,
        "02:00": 52,
        "03:00": 48,
        "04:00": 35,
        "05:00": 42,
        "06:00": 51,
        "07:00": 68,
        "08:00": 92,
        "09:00": 115,
        "10:00": 128,
        "11:00": 142,
        "12:00": 156,
        "13:00": 148,
        "14:00": 162,
        "15:00": 158,
        "16:00": 141,
        "17:00": 135,
        "18:00": 128,
        "19:00": 112,
        "20:00": 98,
        "21:00": 85,
        "22:00": 72,
        "23:00": 58
      }
    },
    "detailedViews": [
      {
        "displayId": "607f1f77bcf86cd799439055",
        "country": "US",
        "date": "2026-01-20",
        "time": "14:32:45",
        "hour": "14:00",
        "position": "HOME_BANNER",
        "userClicked": true,
        "clickedAt": "2026-01-20T14:33:12.000Z",
        "displayedAt": "2026-01-20T14:32:45.000Z"
      },
      {
        "displayId": "607f1f77bcf86cd799439056",
        "country": "UK",
        "date": "2026-01-20",
        "time": "14:35:20",
        "hour": "14:00",
        "position": "HOME_BANNER",
        "userClicked": false,
        "clickedAt": null,
        "displayedAt": "2026-01-20T14:35:20.000Z"
      }
    ]
  }
}
```

**Error Responses:**

**Status Code:** `404 Not Found`

```json
{
  "success": false,
  "message": "Advertisement not found"
}
```

**Status Code:** `403 Forbidden`

```json
{
  "success": false,
  "message": "You do not have permission to view this advertisement's statistics"
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Error fetching advertisement statistics",
  "error": "Error details"
}
```

---

### 2. Get User's Advertisements with View Summary

**Endpoint:** `GET /api/v1/advertisement/my-ads`

**Description:** Retrieves all advertisements for the authenticated user with a summary of view statistics for each ad.

**Authentication:** Required (User token)

**Request Headers:**

```
Authorization: Bearer {user_token}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|--------|---------|--------------------------------|
| status | String | - | Filter by status (DRAFT, ACTIVE, PAUSED, REJECTED, COMPLETED) |
| position | String | - | Filter by position (HOME_BANNER, BOTTOM_CIRCLE) |
| page | Number | 1 | Page number for pagination |
| limit | Number | 10 | Number of records per page |

**Example Request:**

```
GET /api/v1/advertisement/my-ads?status=ACTIVE&position=HOME_BANNER&page=1&limit=10
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "position": "HOME_BANNER",
      "country": "US",
      "imageUrl": "https://example.com/ads/image-1.jpg",
      "redirectUrl": "https://t.me/example_channel",
      "displayCount": 5000,
      "displayUsed": 1250,
      "displayRemaining": 3750,
      "status": "ACTIVE",
      "viewCount": 1250,
      "clickCount": 85,
      "ctrPercentage": 6.8,
      "viewsByCountry": {
        "US": 450,
        "UK": 380,
        "CA": 210,
        "IN": 180,
        "Unknown": 30
      },
      "createdAt": "2026-01-15T10:30:00.000Z",
      "lastDisplayedAt": "2026-01-20T14:35:20.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "position": "BOTTOM_CIRCLE",
      "country": "GB",
      "imageUrl": "https://example.com/ads/image-2.jpg",
      "redirectUrl": "https://t.me/another_channel",
      "displayCount": 2000,
      "displayUsed": 580,
      "displayRemaining": 1420,
      "status": "ACTIVE",
      "viewCount": 580,
      "clickCount": 42,
      "ctrPercentage": 7.24,
      "viewsByCountry": {
        "GB": 320,
        "FR": 180,
        "DE": 80
      },
      "createdAt": "2026-01-18T08:15:00.000Z",
      "lastDisplayedAt": "2026-01-20T13:22:10.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}
```

**Error Responses:**

**Status Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Error fetching advertisements",
  "error": "Error details"
}
```

---

## Response Data Structure

### Advertisement Statistics Object

| Field                    | Type   | Description                                                 |
| ------------------------ | ------ | ----------------------------------------------------------- |
| `advertisementId`        | String | MongoDB ObjectId of the advertisement                       |
| `position`               | String | Ad position (HOME_BANNER, BOTTOM_CIRCLE)                    |
| `country`                | String | Target country for the advertisement                        |
| `status`                 | String | Current status (DRAFT, ACTIVE, PAUSED, REJECTED, COMPLETED) |
| `totalViews`             | Number | Total number of times ad was displayed                      |
| `totalClicks`            | Number | Total number of clicks on the ad                            |
| `ctrPercentage`          | Number | Click-Through Rate percentage (0-100)                       |
| `summary.viewsByCountry` | Object | Breakdown of views by country codes                         |
| `summary.viewsByDate`    | Object | Breakdown of views by date (YYYY-MM-DD)                     |
| `summary.viewsByTime`    | Object | Breakdown of views by hour (HH:00)                          |
| `detailedViews`          | Array  | Array of individual view records                            |

### Detailed View Record

| Field         | Type              | Description                                       |
| ------------- | ----------------- | ------------------------------------------------- |
| `displayId`   | String            | Unique ID for this view/impression                |
| `country`     | String            | Country code where ad was viewed                  |
| `date`        | String            | Date of view (YYYY-MM-DD format)                  |
| `time`        | String            | Exact time of view (HH:mm:ss format)              |
| `hour`        | String            | Hour of view (HH:00 format)                       |
| `position`    | String            | Ad position (HOME_BANNER, BOTTOM_CIRCLE)          |
| `userClicked` | Boolean           | Whether user clicked on the ad                    |
| `clickedAt`   | String (ISO 8601) | Timestamp when user clicked (null if not clicked) |
| `displayedAt` | String (ISO 8601) | Timestamp when ad was displayed                   |

---

## Usage Examples

### Example 1: Get Complete Stats for a Single Ad

```bash
curl -X GET "https://api.example.com/api/v1/advertisement/507f1f77bcf86cd799439011/stats" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### Example 2: Get Active Ads with View Summary

```bash
curl -X GET "https://api.example.com/api/v1/advertisement/my-ads?status=ACTIVE" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### Example 3: Get Ads by Position with Pagination

```bash
curl -X GET "https://api.example.com/api/v1/advertisement/my-ads?position=HOME_BANNER&page=2&limit=20" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

---

## Data Analysis Use Cases

### 1. Peak Viewing Hours

Use `summary.viewsByTime` to identify when your ads receive the most views and plan targeting accordingly.

### 2. Geographic Performance

Use `summary.viewsByCountry` to see which countries have the highest engagement and consider budget allocation.

### 3. Performance Trends

Use `summary.viewsByDate` to track performance over time and identify peak days.

### 4. Individual View Tracking

Use `detailedViews` to:

- Export view records for detailed analysis
- Track conversion patterns for clicked ads
- Monitor view patterns by country and time of day
- Generate custom reports

### 5. Campaign Optimization

Compare CTR across multiple ads to identify:

- Best performing ad positions
- Most effective ad formats
- Optimal targeting regions

---

## Authentication

All endpoints require a valid user JWT token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

Tokens must be obtained through the user login endpoint.

---

## Rate Limiting

No specific rate limits are currently implemented for these endpoints. Requests are processed based on server capacity.

---

## Filtering & Sorting

### My-Ads Endpoint Filters

The `/my-ads` endpoint supports the following filters:

- **status**: Filter by advertisement status
  - `DRAFT` - Advertisement in draft state
  - `ACTIVE` - Currently active advertisement
  - `PAUSED` - Temporarily paused
  - `REJECTED` - Rejected by admin
  - `COMPLETED` - Display count reached

- **position**: Filter by ad placement position
  - `HOME_BANNER` - Homepage banner position
  - `BOTTOM_CIRCLE` - Bottom circle carousel position

Filters can be combined:

```
GET /api/v1/advertisement/my-ads?status=ACTIVE&position=HOME_BANNER
```

---

## Notes

1. **Permission Handling**: Users can only view statistics for their own advertisements. Attempting to view another user's ad statistics will return a 403 Forbidden error.

2. **View Data Accuracy**: View statistics are based on display logs recorded in the `AdvertisementDisplayLog` collection. Views are logged when the ad is displayed to a user.

3. **Click Attribution**: Clicks are only attributed if the user clicked on the ad. The `clickedAt` timestamp indicates when the user clicked.

4. **Unknown Country**: If country information is not available for a view, it will be grouped under "Unknown" in the `viewsByCountry` summary.

5. **Historical Data**: All historical view data is retained. The API does not have a default date filter, so it returns all-time statistics. To analyze specific date ranges, manually filter the `detailedViews` array on the client side.

6. **Real-time Updates**: Statistics are updated in real-time as views and clicks are recorded.

---

## Related Endpoints

- `GET /api/v1/advertisement/my-stats` - Get comprehensive credit and display statistics
- `GET /api/v1/advertisement/packages` - Get available advertisement packages
- `GET /api/v1/advertisement/my-credits` - Get current credit balance
- `POST /api/v1/advertisement/create` - Create a new advertisement

---

## Changelog

**Version 1.0** (2026-01-20)

- Initial release of advertisement statistics API
- Added detailed view tracking by country, date, and time
- Added summary statistics for quick overview
- Integrated with existing my-ads endpoint

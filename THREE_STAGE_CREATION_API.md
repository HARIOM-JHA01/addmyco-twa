# 3-Stage Creation Process - API Documentation

## Overview

This document describes the new 3-stage creation process for creating employees, donators, and operators. Instead of creating a complete user account in one step, the creation process is now divided into 3 stages:

1. **Stage 1**: Enter Telegram Username
2. **Stage 2**: Profile Creation (Personal Information)
3. **Stage 3**: Company Information

This allows for a more flexible and user-friendly account creation process.

---

## Data models

### User Model Updates
- Added `creationStage` field (0-3) to track creation progress
  - 0 = not started
  - 1 = stage 1 complete (telegram registered)
  - 2 = stage 2 complete (profile information added)
  - 3 = stage 3 complete (company information added)

### Operator Model Updates
- Added `creationStage` field (0-3) to track creation progress
- Same stages as users apply

---

## EMPLOYEE 3-STAGE CREATION

### Stage 1: Register Telegram Username

**Endpoint**: `POST /enterprise/operator/three-stage/employee/stage1`

**Authentication**: Operator token required

**Request Body**:
```json
{
  "telegramUsername": "myusername"
}
```

**Required Fields**:
- `telegramUsername` (string, min 3 chars): The employee's Telegram username

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Stage 1 complete: Telegram username registered",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "myusername",
    "freeUsername": "a1b2c3d4",
    "tgid": "myusername",
    "stage": 1,
    "nextStage": "Profile Information"
  }
}
```

**Error Responses**:
- 409: Telegram username already registered
- 409: Insufficient credits
- 422: Validation error

**Notes**:
- Deducts 1 credit from operator account
- Creates a user record at stage 1
- Returns both `username` (active) and `freeUsername` (permanent)

---

### Stage 2: Update Profile Information

**Endpoint**: `PUT /enterprise/operator/three-stage/employee/:userId/stage2`

**Authentication**: Operator token required

**URL Parameters**:
- `userId`: The user ID returned from Stage 1

**Request Body**:
```json
{
  "owner_name_english": "John Doe",
  "owner_name_chinese": "約翰·道",
  "contact": "+1234567890",
  "whatsapp": "+1234567890",
  "address1": "123 Main Street",
  "address2": "Suite 100",
  "address3": "New York",
  "email": "john@example.com",
  "instagram": "@johndoe",
  "linkedin": "linkedin.com/in/johndoe",
  "youtube": "@johndoe",
  "facebook": "facebook.com/johndoe",
  "wechat": "johndoe123",
  "twitter": "@johndoe",
  "line": "johndoe123",
  "tiktok": "@johndoe"
}
```

**Required Fields**:
- `owner_name_english` (string)
- `owner_name_chinese` (string)
- `contact` (string)

**Optional Fields**:
- All social media and contact information fields

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Stage 2 complete: Profile information saved",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "stage": 2,
    "nextStage": "Company Information",
    "profile": {
      "nameEnglish": "John Doe",
      "nameChinese": "約翰·道",
      "contact": "+1234567890"
    }
  }
}
```

**Error Responses**:
- 404: Employee not found
- 422: Validation error
- 500: Server error

**Notes**:
- Updates `profilestatus` to 1 (complete)
- Updates `creationStage` to 2

---

### Stage 3: Update Company Information

**Endpoint**: `PUT /enterprise/operator/three-stage/employee/:userId/stage3`

**Authentication**: Operator token required

**URL Parameters**:
- `userId`: The user ID returned from Stage 1

**Request Body** (multipart/form-data):
```json
{
  "company_name_english": "Acme Corporation",
  "company_name_chinese": "ACME公司",
  "designation": "Director",
  "description": "Leading company in digital solutions",
  "website": "https://example.com",
  "telegram_link": "https://t.me/acmecompany",
  "facebook": "facebook.com/acmecompany",
  "instagram": "@acmecompany",
  "youtube": "@acmecompany",
  "display_order": 1
}
```

**Files** (optional):
- `videos`: Up to 3 video files for company showcase

**Required Fields**:
- `company_name_english` (string)
- `company_name_chinese` (string)
- `designation` (string)

**Optional Fields**:
- All other company information fields
- `videos` (file uploads, max 3)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Stage 3 complete: Employee account fully created",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "stage": 3,
    "status": "Complete",
    "company": {
      "nameEnglish": "Acme Corporation",
      "nameChinese": "ACME公司",
      "designation": "Director"
    }
  }
}
```

**Error Responses**:
- 404: Employee not found
- 422: Validation error

**Notes**:
- Updates `companystatus` to 1 (complete)
- Updates `creationStage` to 3 (full completion)
- Stores up to 3 videos

---

## DONATOR 3-STAGE CREATION

The donator creation process follows the same 3-stage workflow as employees but with slight differences in user type.

### Stage 1: Register Telegram Username

**Endpoint**: `POST /enterprise/operator/three-stage/donator/stage1`

**Authentication**: Operator token required

**Request Body**:
```json
{
  "telegramUsername": "donatorusername"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Stage 1 complete: Telegram username registered",
  "data": {
    "userId": "507f1f77bcf86cd799439012",
    "username": "donatorusername",
    "freeUsername": "x1y2z3w4",
    "tgid": "donatorusername",
    "stage": 1,
    "type": "donator"
  }
}
```

---

### Stage 2: Update Donator Profile Information

**Endpoint**: `PUT /enterprise/operator/three-stage/donator/:userId/stage2`

**Authentication**: Operator token required

**Request Body**: Same as Employee Stage 2

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Stage 2 complete: Profile information saved",
  "data": {
    "userId": "507f1f77bcf86cd799439012",
    "stage": 2,
    "type": "donator"
  }
}
```

---

### Stage 3: Update Donator Company Information

**Endpoint**: `PUT /enterprise/operator/three-stage/donator/:userId/stage3`

**Authentication**: Operator token required

**Request Body**: Same as Employee Stage 3

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Stage 3 complete: Donator account fully created",
  "data": {
    "userId": "507f1f77bcf86cd799439012",
    "stage": 3,
    "status": "Complete",
    "type": "donator"
  }
}
```

---

## OPERATOR 3-STAGE CREATION

Operators are created by enterprises (not by other operators).

### Stage 1: Register Operator Telegram Username

**Endpoint**: `POST /enterprise/me/three-stage/operator/stage1`

**Authentication**: Enterprise token required

**Request Body**:
```json
{
  "telegramUsername": "operatorusername"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Stage 1 complete: Telegram username registered",
  "data": {
    "operatorId": "607f1f77bcf86cd799439013",
    "username": "operatorusername",
    "tgid": "operatorusername",
    "stage": 1,
    "type": "operator"
  }
}
```

---

### Stage 2: Update Operator Profile Information

**Endpoint**: `PUT /enterprise/me/three-stage/operator/:operatorId/stage2`

**Authentication**: Enterprise token required

**URL Parameters**:
- `operatorId`: The operator ID returned from Stage 1

**Request Body**:
```json
{
  "name": "Operator Name",
  "contact": "+1234567890",
  "whatsapp": "+1234567890",
  "address1": "123 Main Street",
  "address2": "Suite 100",
  "address3": "City",
  "email": "operator@example.com",
  "instagram": "@operator",
  "linkedin": "linkedin.com/in/operator",
  "youtube": "@operator",
  "facebook": "facebook.com/operator",
  "wechat": "operator123",
  "twitter": "@operator",
  "line": "operator123",
  "tiktok": "@operator"
}
```

**Required Fields**:
- `name` (string)
- `contact` (string)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Stage 2 complete: Profile information saved",
  "data": {
    "operatorId": "607f1f77bcf86cd799439013",
    "stage": 2,
    "type": "operator"
  }
}
```

---

### Stage 3: Update Operator Company Information

**Endpoint**: `PUT /enterprise/me/three-stage/operator/:operatorId/stage3`

**Authentication**: Enterprise token required

**URL Parameters**:
- `operatorId`: The operator ID returned from Stage 1

**Request Body**:
```json
{
  "company_name_english": "Operator Company",
  "company_name_chinese": "运营商公司",
  "designation": "Manager",
  "description": "Company description",
  "website": "https://example.com",
  "telegram_link": "https://t.me/operatorcompany",
  "facebook": "facebook.com/operatorcompany",
  "instagram": "@operatorcompany",
  "youtube": "@operatorcompany",
  "display_order": 1
}
```

**Required Fields**:
- `company_name_english` (string)
- `company_name_chinese` (string)
- `designation` (string)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Stage 3 complete: Operator account fully created",
  "data": {
    "operatorId": "607f1f77bcf86cd799439013",
    "stage": 3,
    "status": "Complete",
    "type": "operator"
  }
}
```

---

## Flow Diagrams

### Employee/Donator Creation Flow

```
┌─────────────────────────────────────┐
│ Stage 1: Telegram Username Entry    │
│ POST /three-stage/employee/stage1   │
│ - Validates telegram username       │
│ - Creates user at stage 1           │
│ - Deducts 1 credit                  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Stage 2: Profile Information         │
│ PUT /three-stage/employee/:id/stage2│
│ - Adds personal details             │
│ - Adds social media links           │
│ - Updates to stage 2                │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Stage 3: Company Information         │
│ PUT /three-stage/employee/:id/stage3│
│ - Adds company details              │
│ - Uploads videos (optional)         │
│ - Completes creation (stage 3)      │
└─────────────────────────────────────┘
```

### Operator Creation Flow

```
┌─────────────────────────────────────────┐
│ Stage 1: Operator Telegram Username     │
│ POST /three-stage/operator/stage1       │
│ - Creates operator record at stage 1    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Stage 2: Operator Profile               │
│ PUT /three-stage/operator/:id/stage2    │
│ - Adds operator details                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Stage 3: Operator Company               │
│ PUT /three-stage/operator/:id/stage3    │
│ - Completes operator profile            │
└─────────────────────────────────────────┘
```

---

## Common Fields Reference

### Stage 2 Profile Fields (Used by Employees & Donators)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| owner_name_english | string | Yes | Person's english name |
| owner_name_chinese | string | Yes | Person's chinese name |
| contact | string | Yes | Phone number |
| whatsapp | string | No | WhatsApp number |
| address1 | string | No | Primary address |
| address2 | string | No | Secondary address |
| address3 | string | No | Tertiary address (city/state) |
| email | string | No | Email address |
| instagram | string | No | Instagram handle |
| linkedin | string | No | LinkedIn profile URL |
| youtube | string | No | YouTube channel |
| facebook | string | No | Facebook profile |
| wechat | string | No | WeChat ID |
| twitter | string | No | Twitter handle |
| line | string | No | LINE ID |
| tiktok | string | No | TikTok handle |

### Stage 3 Company Fields (Used by Employees & Donators)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| company_name_english | string | Yes | Company name in English |
| company_name_chinese | string | Yes | Company name in Chinese |
| designation | string | Yes | Job title/designation |
| description | string | No | Company description |
| website | string | No | Company website URL |
| telegram_link | string | No | Telegram group/channel link |
| facebook | string | No | Facebook business page |
| instagram | string | No | Instagram business account |
| youtube | string | No | YouTube channel |
| display_order | number | No | Display order (default: 1) |
| videos | file | No | Up to 3 videos (multipart/form-data) |

---

## Error Handling

All endpoints follow consistent error response patterns:

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid request format"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "Telegram username already registered"
}
```

### 422 - Unprocessable Entity (Validation Error)
```json
{
  "success": false,
  "errors": {
    "field_name": ["validation error message"]
  }
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Employee not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "error details"
}
```

---

## Implementation Notes

### Audit Logging
All stage completions are logged in the `EnterpriseAudit` collection with:
- Actor type (operator/enterprise)
- Action (employee.stage1, employee.stage2, etc.)
- Entity type and ID
- Relevant details

### Credits System
- Employees/Donators: 1 credit deducted at Stage 1
- Operators: No credit deduction (created by enterprise)

### Status Tracking
- `creationStage`: Tracks progression (0-3)
- `profilestatus`: Set to 1 after Stage 2
- `companystatus`: Set to 1 after Stage 3

### Data Validation
- All required fields are validated
- Telegram usernames must be unique
- Email format validation when provided
- Phone number format validation when provided

---

## Frontend Integration Tips

1. **Store userId/operatorId**: After Stage 1, save the returned ID for use in Stage 2 and 3
2. **Progressive UI**: Show next stage only after current stage completes
3. **Validation**: Validate required fields before making requests
4. **Error Handling**: Display error messages to user with clear guidance
5. **Credits Check**: Before Stage 1, verify operator has sufficient credits

---

## Migration from Old API

The old single-step creation endpoints still exist:
- `POST /enterprise/operator/create-employee` (old API)
- `POST /enterprise/me/employees` (old API)

These will continue to work but are now deprecated. New implementations should use the 3-stage process.

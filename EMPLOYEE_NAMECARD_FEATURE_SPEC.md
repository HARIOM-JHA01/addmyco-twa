# Employee Namecard with Company & Chamber Template Selection - Frontend Implementation Guide

## Feature Overview

This feature allows **Donators (Enterprise users)** and **Operators** to create and manage separate, reusable company and chamber templates, then assign them to employee namecards during creation. Operators can access their parent enterprise's templates in addition to their own.

### Key Capabilities

- ✅ Dedicated CompanyTemplate and ChamberTemplate entities (separate from Company/Chamber models)
- ✅ Both donators and operators can create, read, update, and delete templates
- ✅ Operators inherit parent enterprise's templates (organization-wide access)
- ✅ Employee namecards link to company templates (required) and chamber templates (optional)
- ✅ Template changes automatically apply to linked employees (reference pattern)
- ✅ Full API for template lifecycle management: list, create, view, edit, delete
- ✅ Dropdown UI shows template name only for simplicity

---

## API Endpoints

### Company Template Endpoints

#### 1. Create Company Template

**Endpoint**: `POST /enterprise/operator/company-templates` (operator)  
**Endpoint**: `POST /enterprise/donator/company-templates` (donator user)  
**Endpoint**: `POST /enterprise/me/company-templates` (enterprise owner)  
**Authentication**: Required  
**Request Type**: Multipart Form Data (file upload support)

**Form Fields**:

**Required:**

- `template_title` (string): Display name for this template (e.g., "Tech Corp Template")

**Optional (all Company fields):**

- `company_name_english`, `company_name_chinese`, `companydesignation`, `description`
- `email`, `WhatsApp`, `WeChat`, `Line`, `Instagram`, `Facebook`, `Twitter`, `Youtube`, `Linkedin`, `SnapChat`, `Skype`, `TikTok`
- `telegramId`, `contact`, `fax`, `website`, `fanpage`
- `companystatus` (number, default: 0), `company_order` (number, default: 1)
- `image` (file), `video` (file)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Company template created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "owner_id": "userId_or_operatorId",
    "owner_type": "enterprise|operator",
    "template_title": "Tech Corp Template",
    "company_name_english": "Tech Corp",
    "company_name_chinese": "科技公司",
    "companydesignation": "Software Company",
    "image": "assets/companyprofile/1707056400.img.jpg",
    "video": null,
    "date": "2026-02-17T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Not authenticated
- `422 Unprocessable Entity`: `template_title` is required

---

#### 2. List Company Templates

**Endpoint**: `GET /enterprise/operator/company-templates` (operator's templates)  
**Endpoint**: `GET /enterprise/donator/company-templates` (donator's templates)  
**Endpoint**: `GET /enterprise/me/company-templates` (enterprise owner's templates)  
**Authentication**: Required

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Company templates retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "owner_id": "userId_or_operatorId",
      "owner_type": "enterprise|operator",
      "template_title": "Tech Corp Template",
      "company_name_english": "Tech Corp",
      "company_name_chinese": "科技公司",
      "companydesignation": "Software Company",
      "company_order": 1,
      "date": "2026-02-17T10:30:00.000Z"
    }
  ]
}
```

---

#### 3. Get Company Template by ID

**Endpoint**: `GET /enterprise/operator/company-templates/:id`  
**Endpoint**: `GET /enterprise/donator/company-templates/:id`  
**Endpoint**: `GET /enterprise/me/company-templates/:id`  
**Authentication**: Required

**Response** (200 OK): Same as create response  
**Error Responses**:

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Template doesn't exist or not owned by user

---

#### 4. Update Company Template

**Endpoint**: `PUT /enterprise/operator/company-templates/:id`  
**Endpoint**: `PUT /enterprise/donator/company-templates/:id`  
**Endpoint**: `PUT /enterprise/me/company-templates/:id`  
**Authentication**: Required  
**Request Type**: Multipart Form Data

**Form Fields**: All optional (only provided fields are updated)

**Response** (200 OK): Updated template object

**Error Responses**:

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Template doesn't exist or not owned by user

---

#### 5. Delete Company Template

**Endpoint**: `DELETE /enterprise/operator/company-templates/:id`  
**Endpoint**: `DELETE /enterprise/donator/company-templates/:id`  
**Endpoint**: `DELETE /enterprise/me/company-templates/:id`  
**Authentication**: Required

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Company template deleted successfully"
}
```

**Error Responses**:

- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Template doesn't exist or not owned by user

---

### Chamber Template Endpoints

#### 6. Create Chamber Template

**Endpoint**: `POST /enterprise/operator/chamber-templates`  
**Endpoint**: `POST /enterprise/donator/chamber-templates`  
**Endpoint**: `POST /enterprise/me/chamber-templates`  
**Authentication**: Required  
**Request Type**: Multipart Form Data

**Form Fields**:

**Required:**

- `template_title` (string): Display name for this template

**Optional (all Chamber fields):**

- `chamber_name_english`, `chamber_name_chinese`, `chamberdesignation`, `detail`
- `tgchannel`, `chamberfanpage`, `chamberwebsite`, `chamber_order`
- `WhatsApp`, `WeChat`, `Line`, `Instagram`, `Facebook`, `Twitter`, `Youtube`, `Linkedin`, `SnapChat`, `Skype`, `TikTok`
- `usertype` (number, default: 0)
- `image` (file), `video` (file)

**Response** (200 OK): Similar to company template response

---

#### 7. List Chamber Templates

**Endpoint**: `GET /enterprise/operator/chamber-templates`  
**Endpoint**: `GET /enterprise/donator/chamber-templates`  
**Endpoint**: `GET /enterprise/me/chamber-templates`  
**Authentication**: Required

---

#### 8. Get Chamber Template by ID

**Endpoint**: `GET /enterprise/operator/chamber-templates/:id`  
**Endpoint**: `GET /enterprise/donator/chamber-templates/:id`  
**Endpoint**: `GET /enterprise/me/chamber-templates/:id`  
**Authentication**: Required

---

#### 9. Update Chamber Template

**Endpoint**: `PUT /enterprise/operator/chamber-templates/:id`  
**Endpoint**: `PUT /enterprise/donator/chamber-templates/:id`  
**Endpoint**: `PUT /enterprise/me/chamber-templates/:id`  
**Authentication**: Required  
**Request Type**: Multipart Form Data

---

#### 10. Delete Chamber Template

**Endpoint**: `DELETE /enterprise/operator/chamber-templates/:id`  
**Endpoint**: `DELETE /enterprise/donator/chamber-templates/:id`  
**Endpoint**: `DELETE /enterprise/me/chamber-templates/:id`  
**Authentication**: Required

---

### Get Company Templates (Dropdown)

**Endpoint**: `GET /company-templates` (user dropdown)  
**Endpoint**: `GET /enterprise/operator/company-templates` (operator dropdown)  
**Authentication**: Required  
**User Types**: Regular users, Donators, Operators

**Description**: Retrieves templates accessible to the authenticated user for dropdown selection in employee namecard creation form.

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Company templates retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "company_name_english": "Tech Corp",
      "company_name_chinese": "科技公司",
      "companydesignation": "Software Company"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "company_name_english": "Finance Ltd",
      "company_name_chinese": "财务公司",
      "companydesignation": "Financial Services"
    }
  ]
}
```

**Access Rules**:

- **Regular users**: See only their own templates
- **Donators (enterprise users)**: See only their own templates
- **Operators**: See parent enterprise's templates + own templates

**Error Responses**:

- `401 Unauthorized`: `{ "success": false, "message": "Authentication required" }`

**Frontend Usage**:

```javascript
// Fetch company templates for dropdown
async function getCompanyTemplates(isOperator = false) {
  const endpoint = isOperator
    ? "/enterprise/operator/company-templates"
    : "/company-templates";
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}
```

---

### Get Chamber Templates (Dropdown)

**Endpoint**: `GET /chamber-templates` (user dropdown)  
**Endpoint**: `GET /enterprise/operator/chamber-templates` (operator dropdown)

**Authentication**: Required  
**User Types**: Regular users, Donators, Operators

**Description**: Retrieves chamber templates accessible to the authenticated user for dropdown selection.

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Chamber templates retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "chamber_name_english": "Chamber of Commerce",
      "chamber_name_chinese": "商会",
      "chamberdesignation": "Business Association"
    }
  ]
}
```

**Access Rules**:

- **Regular users**: See only their own templates
- **Donators**: See only their own templates
- **Operators**: See parent enterprise's templates + own templates

**Error Responses**:

- `401 Unauthorized`: `{ "success": false, "message": "Authentication required" }`

---

### Create Employee Namecard

**Endpoint**: `POST /employee-namecard` (user)  
**Endpoint**: `POST /enterprise/operator/employee-namecard` (operator)

**Endpoint**: `POST /employee-namecard`  
**Authentication**: Required (isUser middleware)  
**User Types**: Regular users, Donators, Operators  
**Request Type**: Multipart Form Data (file upload support)

**Form Fields**:

**Required Fields:**

- `name_english` (string): Employee's full name in English
- `name_chinese` (string): Employee's full name in Chinese
- `telegram_username` (string): Telegram username/handle
- `contact_number` (string): Contact phone number
- `address1` (string): Primary address
- `address2` (string): Secondary address
- `address3` (string): Tertiary address
- `whatsapp_link` (string): WhatsApp contact link or number
- `company_template_id` (string): MongoDB ObjectId of company template (must be accessible)
- `file1` (file): Profile image or video file (image/_ or video/_)

**Optional Fields:**

- `email` (string): Email address
- `facebook` (string): Facebook profile URL
- `instagram` (string): Instagram profile URL or handle
- `x_twitter` (string): X (formerly Twitter) profile URL or handle
- `line` (string): LINE identifier
- `youtube` (string): YouTube channel URL
- `website` (string): Personal/professional website
- `chamber_template_id` (string): MongoDB ObjectId of chamber template (optional)
- `file2` (file): Additional media file (image or video) - optional second file

**Example Form Data:**

```multipart/form-data
Content-Disposition: form-data; name="name_english"
John Doe

Content-Disposition: form-data; name="name_chinese"
约翰·多

Content-Disposition: form-data; name="telegram_username"
john_doe_123

Content-Disposition: form-data; name="contact_number"
+65 9876 5432

Content-Disposition: form-data; name="address1"
Block 123 Main Street

Content-Disposition: form-data; name="address2"
Unit 456, Singapore 123456

Content-Disposition: form-data; name="address3"
Southeast Asia Region

Content-Disposition: form-data; name="whatsapp_link"
https://wa.me/6598765432

Content-Disposition: form-data; name="email"
john@example.com

Content-Disposition: form-data; name="facebook"
https://facebook.com/johndoe

Content-Disposition: form-data; name="instagram"
@johndoe_official

Content-Disposition: form-data; name="x_twitter"
@johndoe

Content-Disposition: form-data; name="line"
johndoe_line

Content-Disposition: form-data; name="youtube"
https://youtube.com/@johndoe

Content-Disposition: form-data; name="website"
https://johndoe.com

Content-Disposition: form-data; name="company_template_id"
507f1f77bcf86cd799439011

Content-Disposition: form-data; name="chamber_template_id"
507f1f77bcf86cd799439013

Content-Disposition: form-data; name="file1"; filename="profile.jpg"
[binary image data]

Content-Disposition: form-data; name="file2"; filename="profile_video.mp4"
[binary video data]
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Employee namecard created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name_english": "John Doe",
    "name_chinese": "约翰·多",
    "telegram_username": "john_doe_123",
    "contact_number": "+65 9876 5432",
    "address1": "Block 123 Main Street",
    "address2": "Unit 456, Singapore 123456",
    "address3": "Southeast Asia Region",
    "whatsapp_link": "https://wa.me/6598765432",
    "profile_image": "1707056400.a1b2c3d4.profile.jpg",
    "profile_video": "1707056401.e5f6g7h8.profile_video.mp4",
    "email": "john@example.com",
    "facebook": "https://facebook.com/johndoe",
    "instagram": "@johndoe_official",
    "x_twitter": "@johndoe",
    "line": "johndoe_line",
    "youtube": "https://youtube.com/@johndoe",
    "website": "https://johndoe.com",
    "company_template": {
      "_id": "507f1f77bcf86cd799439011",
      "company_name_english": "Tech Corp",
      "company_name_chinese": "科技公司",
      "companydesignation": "Software Company"
    },
    "chamber_template": {
      "_id": "507f1f77bcf86cd799439013",
      "chamber_name_english": "Chamber of Commerce",
      "chamber_name_chinese": "商会",
      "chamberdesignation": "Business Association"
    },
    "createdByUser": "507f1f77bcf86cd799439001",
    "createdByOperator": null,
    "isActive": true,
    "status": 0,
    "createdAt": "2026-02-17T10:30:00.000Z",
    "updatedAt": "2026-02-17T10:30:00.000Z"
  }
}
```

**Error Responses**:

- `401 Unauthorized`: `{ "success": false, "message": "Authentication required" }`
- `404 Not Found`: `{ "success": false, "message": "Company template not found" }` or `"Chamber template not found"`
- `403 Forbidden`: `{ "success": false, "message": "You do not have access to this company template" }`
- `422 Unprocessable Entity (Validation)`:

```json
{
  "success": false,
  "errors": {
    "name_english": ["The name_english field is required."],
    "contact_number": ["The contact_number field is required."],
    "company_template_id": ["The company_template_id field is required."]
  }
}
```

- `422 Unprocessable Entity (File validation)`:

```json
{
  "success": false,
  "message": "Please upload at least one profile image or video file."
}
```

**Frontend Usage (JavaScript/FormData)**:

```javascript
async function createEmployeeNamecard(formData, imageFile, videoFile) {
  const form = new FormData();

  // Add required text fields
  form.append("name_english", formData.nameEnglish);
  form.append("name_chinese", formData.nameChinese);
  form.append("telegram_username", formData.telegramUsername);
  form.append("contact_number", formData.contactNumber);
  form.append("address1", formData.address1);
  form.append("address2", formData.address2);
  form.append("address3", formData.address3);
  form.append("whatsapp_link", formData.whatsappLink);
  form.append("company_template_id", formData.selectedCompanyId);

  // Add optional fields
  if (formData.email) form.append("email", formData.email);
  if (formData.facebook) form.append("facebook", formData.facebook);
  if (formData.instagram) form.append("instagram", formData.instagram);
  if (formData.xTwitter) form.append("x_twitter", formData.xTwitter);
  if (formData.line) form.append("line", formData.line);
  if (formData.youtube) form.append("youtube", formData.youtube);
  if (formData.website) form.append("website", formData.website);
  if (formData.selectedChamberId)
    form.append("chamber_template_id", formData.selectedChamberId);

  // Add files
  if (imageFile) form.append("file1", imageFile);
  if (videoFile) form.append("file2", videoFile);

  const response = await fetch("/employee-namecard", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // DO NOT set Content-Type header - browser will set it with boundary
    },
    body: form,
  });
  return await response.json();
}
```

---

### 4. Get Employee Namecards

**Endpoint**: `GET /employee-namecards`  
**Authentication**: Required (isUser middleware)  
**User Types**: Regular users, Donators, Operators

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Employee namecards retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name_english": "John Doe",
      "name_chinese": "约翰·多",
      "telegram_username": "john_doe_123",
      "contact_number": "+65 9876 5432",
      "address1": "Block 123 Main Street",
      "address2": "Unit 456, Singapore 123456",
      "address3": "Southeast Asia Region",
      "whatsapp_link": "https://wa.me/6598765432",
      "profile_image": "https://example.com/assets/employeenamecard/1707056400.a1b2c3d4.profile.jpg",
      "profile_video": "https://example.com/assets/employeenamecard/1707056401.e5f6g7h8.profile_video.mp4",
      "email": "john@example.com",
      "facebook": "https://facebook.com/johndoe",
      "instagram": "@johndoe_official",
      "x_twitter": "@johndoe",
      "company_template": {
        "_id": "507f1f77bcf86cd799439011",
        "company_name_english": "Tech Corp",
        "company_name_chinese": "科技公司",
        "companydesignation": "Software Company"
      },
      "chamber_template": {
        "_id": "507f1f77bcf86cd799439013",
        "chamber_name_english": "Chamber of Commerce",
        "chamber_name_chinese": "商会",
        "chamberdesignation": "Business Association"
      },
      "isActive": true,
      "status": 0,
      "createdAt": "2026-02-17T10:30:00.000Z"
    }
  ]
}
```

      "email": "john@example.com",
      "country": "Singapore",
      "company_template": {
        "_id": "507f1f77bcf86cd799439011",
        "company_name_english": "Tech Corp",
        "company_name_chinese": "科技公司",
        "companydesignation": "Software Company"
      },
      "chamber_template": {
        "_id": "507f1f77bcf86cd799439013",
        "chamber_name_english": "Chamber of Commerce",
        "chamber_name_chinese": "商会",
        "chamberdesignation": "Business Association"
      },
      "createdByUser": "507f1f77bcf86cd799439001",
      "isActive": true,
      "status": 0,
      "createdAt": "2026-02-17T10:30:00.000Z"
    }

]
}

````

**Query Parameters**:

- None (returns all namecards for authenticated user)

**Pagination**: Not implemented in v1 (returns all records)

---

### 5. Update Employee Namecard

**Endpoint**: `POST /update-employee-namecard`
**Authentication**: Required (isUser middleware)
**User Types**: Regular users, Donators, Operators
**Authorization**: Only owner can update
**Request Type**: Multipart Form Data (file upload support) or JSON

**Form/Body Fields** (all optional - only provided fields will be updated):

```multipart/form-data
Content-Disposition: form-data; name="id"
507f1f77bcf86cd799439020

Content-Disposition: form-data; name="name_english"
John Doe Updated

Content-Disposition: form-data; name="name_chinese"
约翰·多（更新）

Content-Disposition: form-data; name="telegram_username"
john_doe_updated

Content-Disposition: form-data; name="contact_number"
+65 9888 7777

Content-Disposition: form-data; name="address1"
New Block 456

Content-Disposition: form-data; name="whatsapp_link"
https://wa.me/6598887777

Content-Disposition: form-data; name="email"
john.new@example.com

Content-Disposition: form-data; name="company_template_id"
507f1f77bcf86cd799439012

Content-Disposition: form-data; name="file1"; filename="new_profile.jpg"
[binary image data - optional]
````

**Field Notes**:

- `id` (required): Namecard ID to update
- All other fields are optional - only provided fields will be updated
- If new files are provided (file1/file2), they will replace existing media
- Template IDs are validated for user access
- File upload works same as create (supports image and video)

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Employee namecard updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name_english": "John Doe Updated",
    "name_chinese": "约翰·多（更新）",
    "telegram_username": "john_doe_updated",
    "contact_number": "+65 9888 7777",
    "address1": "New Block 456",
    "address2": "Unit 456, Singapore 123456",
    "address3": "Southeast Asia Region",
    "whatsapp_link": "https://wa.me/6598887777",
    "profile_image": "1707060000.x1y2z3a4.new_profile.jpg",
    "profile_video": null,
    "email": "john.new@example.com",
    "facebook": "https://facebook.com/johndoe",
    "company_template": {
      "_id": "507f1f77bcf86cd799439012",
      "company_name_english": "Finance Ltd",
      "company_name_chinese": "财务公司",
      "companydesignation": "Financial Services"
    },
    "chamber_template": {
      "_id": "507f1f77bcf86cd799439013",
      "chamber_name_english": "Chamber of Commerce",
      "chamber_name_chinese": "商会",
      "chamberdesignation": "Business Association"
    },
    "updatedAt": "2026-02-17T11:45:00.000Z"
  }
}
```

**Error Responses**:

- `401 Unauthorized`: No authentication
- `404 Not Found`: Namecard or template not found
- `403 Forbidden`: User doesn't own the namecard or lacks template access
- `500 Server Error`: File upload failure

**Frontend Usage (with file upload)**:

```javascript
async function updateEmployeeNamecard(nameCardId, updates, newImageFile) {
  const form = new FormData();

  form.append("id", nameCardId);
  if (updates.nameEnglish) form.append("name_english", updates.nameEnglish);
  if (updates.contactNumber)
    form.append("contact_number", updates.contactNumber);
  if (updates.email) form.append("email", updates.email);
  if (updates.companyTemplateId)
    form.append("company_template_id", updates.companyTemplateId);
  if (newImageFile) form.append("file1", newImageFile);

  const response = await fetch("/update-employee-namecard", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  return await response.json();
}
```

---

### 6. Delete Employee Namecard

**Endpoint**: `DELETE /employee-namecard/:id`  
**Authentication**: Required (isUser middleware)  
**User Types**: Regular users, Donators, Operators  
**Authorization**: Only owner can delete

**Path Parameters**:

- `id` (required): Namecard ID to delete

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Employee namecard deleted successfully"
}
```

**Error Responses**:

- `401 Unauthorized`: No authentication
- `404 Not Found`: Namecard not found
- `403 Forbidden`: User doesn't own the namecard

---

## Operator-Specific Endpoints (Enterprise Routes)

All employee namecard operations are also available under `/enterprise/operator/*` routes for operators:

| Operation             | User Route                       | Operator Route                                       |
| --------------------- | -------------------------------- | ---------------------------------------------------- |
| Get Company Templates | `GET /company-templates`         | `GET /enterprise/operator/company-templates`         |
| Get Chamber Templates | `GET /chamber-templates`         | `GET /enterprise/operator/chamber-templates`         |
| Create Namecard       | `POST /employee-namecard`        | `POST /enterprise/operator/employee-namecard`        |
| List Namecards        | `GET /employee-namecards`        | `GET /enterprise/operator/employee-namecards`        |
| Update Namecard       | `POST /update-employee-namecard` | `POST /enterprise/operator/update-employee-namecard` |
| Delete Namecard       | `DELETE /employee-namecard/:id`  | `DELETE /enterprise/operator/employee-namecard/:id`  |

**Operator Authentication**:

```javascript
// Use operator token instead of user token
const headers = {
  Authorization: `Bearer ${operatorToken}`,
  "Content-Type": "application/json",
};
```

---

## Data Models

### CompanyTemplate Schema

```typescript
{
  _id: ObjectId,

  // Ownership
  owner_id: ObjectId (required) - User ID or Operator ID,
  owner_type: String (enum: ["enterprise", "operator"], required),

  // Template identifier
  template_title: String (required, trim),

  // Company data (all optional, mirrors Company model)
  company_name_english: String,
  company_name_chinese: String,
  companydesignation: String,
  description: String,
  email: String,
  WhatsApp: String,
  WeChat: String,
  Line: String,
  Instagram: String,
  Facebook: String,
  Twitter: String,
  Youtube: String,
  Linkedin: String,
  SnapChat: String,
  Skype: String,
  TikTok: String,
  telegramId: String,
  contact: String,
  fax: String,
  website: String,
  fanpage: String,
  companystatus: Number (default: 0),
  company_order: Number (default: 1),

  // Media
  image: String (trim, with getImageUrl getter),
  video: String (trim, with getImageUrl getter),
  images: Array of Strings,
  videos: Array of Strings,

  date: Date (default: Date.now)
}
```

---

### ChamberTemplate Schema

```typescript
{
  _id: ObjectId,

  // Ownership
  owner_id: ObjectId (required) - User ID or Operator ID,
  owner_type: String (enum: ["enterprise", "operator"], required),

  // Template identifier
  template_title: String (required, trim),

  // Chamber data (all optional, mirrors Chamber model)
  chamber_name_english: String,
  chamber_name_chinese: String,
  chamberdesignation: String,
  detail: String,
  tgchannel: String,
  chamberfanpage: String,
  chamberwebsite: String,
  chamber_order: Number (default: 1),

  // Social media
  WhatsApp: String,
  WeChat: String,
  Line: String,
  Instagram: String,
  Facebook: String,
  Twitter: String,
  Youtube: String,
  Linkedin: String,
  SnapChat: String,
  Skype: String,
  TikTok: String,
  usertype: Number (default: 0),

  // Media
  image: String (trim, with getImageUrl getter),
  video: String (trim, with getImageUrl getter),

  date: Date (default: Date.now)
}
```

---

### EmployeeNamecard Schema

```typescript
{
  _id: ObjectId,

  // Basic employee information - REQUIRED
  name_english: String (required),
  name_chinese: String (required),
  telegram_username: String (required),
  contact_number: String (required),
  address1: String (required),
  address2: String (required),
  address3: String (required),

  // Profile media - REQUIRED
  profile_image: String (trim, with getImageUrl getter),
  profile_video: String (trim, with getImageUrl getter),

  // Social media - REQUIRED
  whatsapp_link: String (required),

  // Optional fields
  email: String (optional),
  facebook: String (optional),
  instagram: String (optional),
  x_twitter: String (optional),
  line: String (optional),
  youtube: String (optional),
  website: String (optional),

  // Template references
  company_template: ObjectId (ref: CompanyTemplate, required),
  chamber_template: ObjectId (ref: ChamberTemplate, optional, default: null),

  // Creator identification (one of these will be populated)
  createdByUser: ObjectId (ref: User, optional),
  createdByOperator: ObjectId (ref: Operator, optional),

  // Metadata
  isActive: Boolean (default: true),
  status: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Notes:**

- `profile_image` and `profile_video` use `setImageUrl` getter to transform relative paths to absolute URLs
- File storage location: `/assets/employeenamecard/`
- File naming format: `{timestamp}.{randomHex}.{originalName}`
- At least one of `profile_image` or `profile_video` must be provided during creation
- Both can be present (e.g., profile photo + intro video)

---

## Permission Logic

### Template Creation & Ownership

Templates are stored in separate collections (CompanyTemplate, ChamberTemplate). Each template has:

- `owner_id`: Reference to the creator (User ID or Operator ID)
- `owner_type`: Identifies if owner is "enterprise" (user) or "operator"

#### Ownership Types

**Enterprise Users (Donators - usertype=2)**

- Create templates with `owner_type: "enterprise"` and `owner_id: userId`
- Can only manage their own templates
- Query: `{ owner_id: userId, owner_type: "enterprise" }`

**Operators (usertype=N/A - separate Operator collection)**

- Create templates with `owner_type: "operator"` and `owner_id: operatorId`
- Can only manage their own templates
- Can access parent enterprise's templates (via `createdByEnterprise` relationship)
- Query own: `{ owner_id: operatorId, owner_type: "operator" }`
- Query inherited: `{ owner_id: parentEnterpriseId, owner_type: "enterprise" }`

**Regular Users (usertype=1)**

- Can create templates but typically not used in this flow
- Can only access their own templates

### Template Access Rules

#### CRUD Operations (Create, Read, Update, Delete)

**Enterprise Users**

- Can only access templates where `owner_id: currentUserId AND owner_type: "enterprise"`

**Operators**

- Can access own templates: `owner_id: operatorId AND owner_type: "operator"`
- Can access parent's templates: `owner_id: parentEnterpriseId AND owner_type: "enterprise"`
- Cannot access other enterprises' templates
- Cannot access other operators' templates

### Namecard Ownership Rules

- **Only creator can**:
  - Update their own namecards
  - Delete their own namecards
- **Can access templates**:
  - Must have permission to access the company_template
  - Must have permission to access the chamber_template (if provided)
- **Cannot access**:
  - Other users' or operators' namecards
  - Templates from other enterprises
  - Templates from other operators

### Template Selection Validation

When creating/updating a namecard:

1. Company template must exist and be accessible to the current user/operator
2. Chamber template (if provided) must exist and be accessible to the current user/operator
3. If templates are inaccessible or don't exist → `403 Forbidden` or `404 Not Found` error

---

## User Flows

### Flow 1: Regular User Creating Employee Namecard

```
1. User navigates to "Create Employee" page
   ↓
2. System fetches company templates: GET /company-templates
   ↓
3. System fetches chamber templates: GET /chamber-templates
   ↓
4. Dropdowns populated with template names
   ↓
5. User fills form:
   - Employee Username
   - Telegram ID
   - Email (optional)
   - Country (optional)
   - Select Company Template (required)
   - Select Chamber Template (optional)
   ↓
6. User clicks "Create Namecard"
   ↓
7. POST /employee-namecard with data
   ↓
8. Server validates:
   - Company template exists and is accessible
   - Chamber template exists and is accessible (if provided)
   - Required fields are present
   ↓
9. Success: Namecard created and linked to templates
   ↓
10. Redirect to Employee Namecards list page
```

### Flow 2: Operator Creating Employee Namecard

```
Same as Flow 1, but:
- Use operator endpoints: /enterprise/operator/*
- Operator inherits parent enterprise's templates
- Operator can access own templates + parent's templates in dropdown
```

### Flow 3: Viewing Linked Employee with Template Details

```
1. User navigates to "Employee Namecards" page
   ↓
2. GET /employee-namecards
   ↓
3. Response includes:
   - Employee details
   - Linked company template (full details)
   - Linked chamber template (full details)
   ↓
4. Display in table/list:
   Employee Name | Company | Chamber | Actions (Edit | Delete)
```

### Flow 4: Updating Employee Namecard Template

```
1. User clicks "Edit" on employee namecard
   ↓
2. Fetch templates: GET /company-templates & GET /chamber-templates
   ↓
3. Pre-populate form with current values
   ↓
4. User changes company/chamber template selection
   ↓
5. POST /update-employee-namecard with new template IDs
   ↓
6. Server validates new templates are accessible
   ↓
7. Success: Namecard templates updated
   ↓
8. Employee now linked to new templates
```

---

## Frontend Implementation Checklist

### Pages/Components to Build

- [ ] **Employee Namecard List Page**
  - Display all namecards with company/chamber details
  - Actions: Edit, Delete
  - Empty state message if no namecards
  - Loading state while fetching

- [ ] **Create Employee Namecard Form**
  - **Required Text Fields:**
    - Text input: Full Name (English)
    - Text input: Full Name (Chinese)
    - Text input: Telegram Username
    - Text input: Contact Number
    - Text input: Address 1 (Primary)
    - Text input: Address 2 (Secondary)
    - Text input: Address 3 (Tertiary)
    - Text input: WhatsApp Link
  - **Optional Text Fields:**
    - Email input field
    - Text input: Facebook URL
    - Text input: Instagram handle
    - Text input: X/Twitter handle
    - Text input: LINE ID
    - Text input: YouTube URL
    - Text input: Website URL
  - **File Upload (Required - at least one):**
    - File input: Profile Image (image/\*)
    - File input: Profile Video (video/\*, optional if image provided)
  - **Template Selection:**
    - Company Template dropdown (required)
      - Fetch from `/company-templates`
      - Display: `company_name_english`
      - Sort by company_order
    - Chamber Template dropdown (optional)
      - Fetch from `/chamber-templates`
      - Display: `chamber_name_english`
      - Sort by chamber_order
  - Submit button
  - Validation error display
  - Success notification after creation
  - Support for FormData (multipart/form-data) submission

- [ ] **Edit Employee Namecard Form**
  - Same as Create form
  - Pre-populate all text fields with existing data
  - Pre-populate file uploads with preview images/videos (optional - can show thumbnails)
  - Allow re-uploading new files (optional)
  - Submit updates to `/update-employee-namecard`
  - Validation error display
  - Success notification after update

- [ ] **Delete Confirmation Modal**
  - Confirm message: "Are you sure you want to delete this employee namecard?"
  - Show employee name in confirmation
  - Delete button
  - Cancel button
  - Handle delete response

- [ ] **Employee Namecard List Display**
  - Show employee name (name_english)
  - Show profile image or video thumbnail
  - Show company template name
  - Show chamber template name (if linked)
  - Show contact number
  - Actions: Edit, Delete
  - Loading state while fetching
  - Empty state message if no records

### Key Implementation Notes

1. **File Upload Handling (Important)**

   ```javascript
   // Use FormData for file uploads
   const formData = new FormData();
   formData.append("name_english", "John Doe");
   formData.append("telegram_username", "john_doe");
   // ... other fields
   formData.append("file1", imageFile); // Main profile file
   formData.append("file2", videoFile); // Optional secondary file

   // When sending, do NOT set Content-Type header
   // Browser will set it automatically with boundary
   fetch("/employee-namecard", {
     method: "POST",
     headers: {
       Authorization: `Bearer ${token}`,
       // DO NOT include 'Content-Type': 'application/json'
     },
     body: formData,
   });
   ```

2. **Form Validation**
   - Validate required fields before submission (name_english, contact_number, etc.)
   - Validate at least one file is selected (image or video)
   - Display backend validation errors from 422 response
   - Show field-specific error messages

3. **File Upload Validation**
   - Check file type (image/_ or video/_)
   - Check file size (optional max size limit)
   - Show file preview before upload
   - Display upload progress indicator

4. **Loading States**
   - Show spinner while fetching templates
   - Show spinner while submitting form
   - Disable submit button during submission
   - Show file upload progress

5. **Error Handling**
   - 401: Redirect to login
   - 403: Show "You don't have access to this template" message
   - 404: Show "Template not found" message
   - 422: Display field validation errors (required field missing, invalid format, etc.)
   - File upload failure: Show "Failed to upload file - please try again"
   - 500: Show "Server error, please try again"

6. **Success Notifications**
   - Created: "Employee namecard created successfully"
   - Updated: "Employee namecard updated successfully"
   - Deleted: "Employee namecard deleted successfully"

7. **Image/Video Preview**
   - Show selected file name before upload
   - Display thumbnail preview if possible
   - After creation, show full profile image/video in list view
   - Use `profile_image` or `profile_video` URLs from response (with baseUrl prepended)

8. **Operator Routes**
   - For operator views, use `/enterprise/operator/*` endpoints
   - For operator auth, use operator token instead of user token
   - Same form structure and validation

---

## Authentication Headers

### For Logged-in Users

```javascript
const headers = {
  Authorization: `Bearer ${userToken}`,
  "Content-Type": "application/json",
};
```

### For Operators

```javascript
const headers = {
  Authorization: `Bearer ${operatorToken}`,
  "Content-Type": "application/json",
};
```

---

## Complete Example Implementation (React)

```javascript
import { useState, useEffect } from "react";

function EmployeeNamecardForm() {
  const [formData, setFormData] = useState({
    name_english: "",
    name_chinese: "",
    telegram_username: "",
    contact_number: "",
    address1: "",
    address2: "",
    address3: "",
    whatsapp_link: "",
    email: "",
    facebook: "",
    instagram: "",
    x_twitter: "",
    line: "",
    youtube: "",
    website: "",
    company_template_id: "",
    chamber_template_id: "",
  });

  const [companies, setCompanies] = useState([]);
  const [chambers, setChambers] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [profileVideo, setProfileVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const [compRes, chamRes] = await Promise.all([
          fetch("/company-templates", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/chamber-templates", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const compData = await compRes.json();
        const chamData = await chamRes.json();

        if (compData.success) setCompanies(compData.data);
        if (chamData.success) setChambers(chamData.data);
      } catch (err) {
        alert("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [token]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fileType === "image") {
      setProfileImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } else if (fileType === "video") {
      setProfileVideo(file);
      setVideoPreview(file.name);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!profileImage && !profileVideo) {
      alert("Please upload at least one profile image or video");
      return;
    }

    setSubmitLoading(true);

    try {
      const form = new FormData();

      // Add text fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          form.append(key, formData[key]);
        }
      });

      // Add files
      if (profileImage) form.append("file1", profileImage);
      if (profileVideo) form.append("file2", profileVideo);

      const response = await fetch("/employee-namecard", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set Content-Type - browser will set with boundary
        },
        body: form,
      });

      const data = await response.json();

      if (data.success) {
        alert("Employee namecard created successfully!");
        // Reset form
        setFormData({...});
        setProfileImage(null);
        setProfileVideo(null);
        setImagePreview(null);
        setVideoPreview(null);
      } else if (response.status === 422) {
        setErrors(data.errors || {});
      } else {
        alert(data.message || "Failed to create namecard");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div>Loading templates...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Employee Namecard</h2>

      {/* Required Fields */}
      <div>
        <label>Full Name (English) *</label>
        <input
          type="text"
          name="name_english"
          value={formData.name_english}
          onChange={handleChange}
          required
          placeholder="e.g., John Doe"
        />
        {errors.name_english && <span className="error">{errors.name_english}</span>}
      </div>

      <div>
        <label>Full Name (Chinese) *</label>
        <input
          type="text"
          name="name_chinese"
          value={formData.name_chinese}
          onChange={handleChange}
          required
          placeholder="e.g., 约翰·多"
        />
        {errors.name_chinese && <span className="error">{errors.name_chinese}</span>}
      </div>

      <div>
        <label>Telegram Username *</label>
        <input
          type="text"
          name="telegram_username"
          value={formData.telegram_username}
          onChange={handleChange}
          required
          placeholder="e.g., john_doe_123"
        />
        {errors.telegram_username && <span className="error">{errors.telegram_username}</span>}
      </div>

      <div>
        <label>Contact Number *</label>
        <input
          type="tel"
          name="contact_number"
          value={formData.contact_number}
          onChange={handleChange}
          required
          placeholder="e.g., +65 9876 5432"
        />
        {errors.contact_number && <span className="error">{errors.contact_number}</span>}
      </div>

      <div>
        <label>Address 1 *</label>
        <input
          type="text"
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          required
          placeholder="e.g., Block 123 Main Street"
        />
        {errors.address1 && <span className="error">{errors.address1}</span>}
      </div>

      <div>
        <label>Address 2 *</label>
        <input
          type="text"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
          required
          placeholder="e.g., Unit 456"
        />
        {errors.address2 && <span className="error">{errors.address2}</span>}
      </div>

      <div>
        <label>Address 3 *</label>
        <input
          type="text"
          name="address3"
          value={formData.address3}
          onChange={handleChange}
          required
          placeholder="e.g., Singapore 123456"
        />
        {errors.address3 && <span className="error">{errors.address3}</span>}
      </div>

      <div>
        <label>WhatsApp Link *</label>
        <input
          type="url"
          name="whatsapp_link"
          value={formData.whatsapp_link}
          onChange={handleChange}
          required
          placeholder="e.g., https://wa.me/6598765432"
        />
        {errors.whatsapp_link && <span className="error">{errors.whatsapp_link}</span>}
      </div>

      {/* Optional Fields */}
      <h3>Optional Information</h3>

      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label>Facebook</label>
        <input
          type="url"
          name="facebook"
          value={formData.facebook}
          onChange={handleChange}
          placeholder="https://facebook.com/johndoe"
        />
      </div>

      <div>
        <label>Instagram</label>
        <input
          type="text"
          name="instagram"
          value={formData.instagram}
          onChange={handleChange}
          placeholder="@johndoe"
        />
      </div>

      <div>
        <label>X/Twitter</label>
        <input
          type="text"
          name="x_twitter"
          value={formData.x_twitter}
          onChange={handleChange}
          placeholder="@johndoe"
        />
      </div>

      <div>
        <label>LINE</label>
        <input
          type="text"
          name="line"
          value={formData.line}
          onChange={handleChange}
          placeholder="johndoe_line"
        />
      </div>

      <div>
        <label>YouTube</label>
        <input
          type="url"
          name="youtube"
          value={formData.youtube}
          onChange={handleChange}
          placeholder="https://youtube.com/@johndoe"
        />
      </div>

      <div>
        <label>Website</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://johndoe.com"
        />
      </div>

      {/* Media Upload */}
      <h3>Profile Media</h3>

      <div>
        <label>Profile Image *</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "image")}
        />
        {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: "150px" }} />}
      </div>

      <div>
        <label>Profile Video (Optional)</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => handleFileChange(e, "video")}
        />
        {videoPreview && <p>Selected: {videoPreview}</p>}
      </div>

      {/* Template Selection */}
      <h3>Company & Chamber</h3>

      <div>
        <label>Company Template *</label>
        <select
          name="company_template_id"
          value={formData.company_template_id}
          onChange={handleChange}
          required
        >
          <option value="">Select a company template</option>
          {companies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.company_name_english}
            </option>
          ))}
        </select>
        {errors.company_template_id && (
          <span className="error">{errors.company_template_id}</span>
        )}
      </div>

      <div>
        <label>Chamber Template (Optional)</label>
        <select
          name="chamber_template_id"
          value={formData.chamber_template_id}
          onChange={handleChange}
        >
          <option value="">Select a chamber template</option>
          {chambers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.chamber_name_english}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={submitLoading}>
        {submitLoading ? "Creating..." : "Create Namecard"}
      </button>
    </form>
  );
}

export default EmployeeNamecardForm;
```

---

## Important Notes

1. **Separate Template Entities** - CompanyTemplate and ChamberTemplate are dedicated collections, completely separate from the Company and Chamber models. They have their own CRUD APIs and storage.

2. **Template ownership (owner_id + owner_type)** - Each template tracks:
   - `owner_id`: User ID (for enterprise users) or Operator ID
   - `owner_type`: "enterprise" or "operator"
   - This enables fine-grained permission control and inheritance

3. **Operator template inheritance** - When an operator fetches templates, they automatically get:
   - Their own templates: `{ owner_id: operatorId, owner_type: "operator" }`
   - Parent enterprise's templates: `{ owner_id: parentEnterpriseId, owner_type: "enterprise" }`
   - Inheritance is based on the operator's `createdByEnterprise` relationship

4. **Template lifecycle** - Templates can be:
   - Created independently by users/operators via dedicated APIs
   - Viewed/listed to see all owned templates
   - Updated to modify any field
   - Deleted when no longer needed
   - Referenced by multiple employee namecards

5. **File Upload Best Practices**
   - Use FormData for multipart uploads
   - Do NOT set Content-Type header when using FormData (browser sets it automatically)
   - Validate file type on frontend before upload
   - Show file preview to user
   - For templates: image and video are both optional
   - For namecards: at least one of profile_image or profile_video must be provided
   - Support up to 2 files per entity (file1 and file2)

6. **Reference vs Copy** - Employee namecards hold a **reference** to templates via ObjectId, not a copy of data. If a template is updated:
   - All linked employees see the updated information immediately
   - No need to rebuild namecards after template changes
   - Deletion of template may break references (consider implementing cascade rules)

7. **Unique tgid constraint** - Employee namecard's `tgid` field is unique across the system. Duplicate tgid will cause MongoDB unique constraint error.

8. **No pagination in v1** - All endpoints return all available records. For large datasets, pagination should be added in v2.

9. **Backward compatibility** - Old Company/Chamber models with `isTemplate: true` are NOT affected and continue to work independently. New template features use the dedicated CompanyTemplate/ChamberTemplate collections.

10. **Date Last Updated** - Updated to February 18, 2026 to reflect new template entities

---

## API Response Status Codes

| Status | Meaning                                  | Entity                      |
| ------ | ---------------------------------------- | --------------------------- |
| 200    | OK - Success with data                   | GET, POST update, DELETE    |
| 201    | Created - New resource created           | POST create                 |
| 401    | Unauthorized - Missing/invalid token     | All authenticated endpoints |
| 403    | Forbidden - User lacks permission        | Access control violations   |
| 404    | Not Found - Resource doesn't exist       | Invalid IDs                 |
| 422    | Unprocessable Entity - Validation failed | Field validation errors     |
| 500    | Server Error - Unexpected error          | Server exceptions           |

---

## Testing Scenarios

### Scenario 1: Create Employee with Company Template Only

```
POST /employee-namecard
{
  "employee_username": "test_user",
  "tgid": "test123",
  "company_template_id": "valid_company_id",
  "chamber_template_id": null
}
Expected: 201 Created, namecard linked to company only
```

### Scenario 2: Create Employee with Invalid Company Template ID

```
POST /employee-namecard
{
  "employee_username": "test_user",
  "tgid": "test123",
  "company_template_id": "invalid_id",
  "chamber_template_id": null
}
Expected: 404 Not Found, "Company template not found"
```

### Scenario 3: Operator Accessing Parent's Templates

```
GET /enterprise/operator/company-templates
(Operator created by Enterprise ABC)
Expected: 200 OK, returns Enterprise ABC's templates + operator's own templates
```

### Scenario 4: User Updating Namecard with New Template

```
POST /update-employee-namecard
{
  "id": "existing_namecard_id",
  "company_template_id": "different_company_id"
}
Expected: 200 OK, namecard now linked to new company template
```

### Scenario 5: Delete Namecard

```
DELETE /employee-namecard/existing_id
Expected: 200 OK, "Employee namecard deleted successfully"
```

---

## Troubleshooting Common Issues

### "You do not have access to this company template"

- **Cause**: User trying to use a template they don't own and aren't an operator of
- **Solution**:
  - Regular users: Can only use their own templates
  - Operators: Can use parent enterprise's templates or their own
  - Ask user to create their own template first

### "Company template not found"

- **Cause**: Template ID doesn't exist or was deleted
- **Solution**: Refresh template dropdown to get updated list

### "Employee namecard not found"

- **Cause**: Trying to update/delete a namecard that doesn't exist
- **Solution**: Refresh list, the namecard may have been deleted by another user

### Duplicate tgid error (500)

- **Cause**: Attempting to create namecard with existing tgid
- **Solution**: Use unique telegram ID for each employee

---

## Future Enhancements (v2)

- [ ] Pagination for template and namecard lists
- [ ] Batch create multiple employee namecards
- [ ] Export employee namecards to CSV/PDF
- [ ] Namecard status updates (active/inactive)
- [ ] Template versioning and history
- [ ] Bulk template assignment to multiple employees
- [ ] Search/filter employee namecards by company/chamber
- [ ] Rate limiting on API endpoints

---

**Last Updated**: February 18, 2026  
**Backend Status**: ✅ Templates CRUD APIs Complete | ✅ Employee Namecard APIs Complete  
**Frontend Status**: 🔄 Ready for Development

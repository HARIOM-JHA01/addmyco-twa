# 3-Stage Creation - Quick Reference Guide

## Quick API Summary

### Employee Creation (Operator creates employee)

```bash
# Stage 1: Register Telegram
curl -X POST http://localhost/enterprise/operator/three-stage/employee/stage1 \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"telegramUsername": "john_doe"}'

# Response: Returns userId

# Stage 2: Add Profile Info
curl -X PUT http://localhost/enterprise/operator/three-stage/employee/$USER_ID/stage2 \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "owner_name_english": "John Doe",
    "owner_name_chinese": "約翰道",
    "contact": "+1234567890",
    "whatsapp": "+1234567890",
    "address1": "123 Main St",
    "address2": "Suite 100",
    "address3": "New York",
    "email": "john@example.com",
    "instagram": "@johndoe",
    "youtube": "@johndoe"
  }'

# Stage 3: Add Company Info + Videos
curl -X PUT http://localhost/enterprise/operator/three-stage/employee/$USER_ID/stage3 \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -F "company_name_english=Acme Corp" \
  -F "company_name_chinese=ACME公司" \
  -F "designation=Director" \
  -F "description=Tech Company" \
  -F "website=https://acme.com" \
  -F "videos=@video1.mp4" \
  -F "videos=@video2.mp4" \
  -F "videos=@video3.mp4"
```

### Donator Creation (Same as Employee)

```bash
# Stage 1
curl -X POST http://localhost/enterprise/operator/three-stage/donator/stage1 \
  -H "Authorization: Bearer $OPERATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"telegramUsername": "donator_user"}'

# Stage 2 & 3: Same endpoints as employee with `/donator/` instead of `/employee/`
```

### Operator Creation (Enterprise creates operator)

```bash
# Stage 1: Register Telegram
curl -X POST http://localhost/enterprise/me/three-stage/operator/stage1 \
  -H "Authorization: Bearer $ENTERPRISE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"telegramUsername": "op_user"}'

# Response: Returns operatorId

# Stage 2: Add Profile
curl -X PUT http://localhost/enterprise/me/three-stage/operator/$OPERATOR_ID/stage2 \
  -H "Authorization: Bearer $ENTERPRISE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Operator Name",
    "contact": "+1234567890",
    "whatsapp": "+1234567890",
    "email": "op@example.com"
  }'

# Stage 3: Complete Profile
curl -X PUT http://localhost/enterprise/me/three-stage/operator/$OPERATOR_ID/stage3 \
  -H "Authorization: Bearer $ENTERPRISE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name_english": "Operator Company",
    "company_name_chinese": "运营商公司",
    "designation": "Manager"
  }'
```

---

## Required Fields by Stage

### Stage 1 (All Types)
- `telegramUsername` - Required, min 3 chars, must be unique

### Stage 2 (Profile - Required)
- `owner_name_english` - Required
- `owner_name_chinese` - Required
- `contact` - Required (phone number)

### Stage 2 (Profile - Optional)
- `whatsapp, address1, address2, address3, email, instagram, linkedin, youtube, facebook, wechat, twitter, line, tiktok`

### Stage 3 (Company - Required)
- `company_name_english` - Required
- `company_name_chinese` - Required
- `designation` - Required

### Stage 3 (Company - Optional)
- `description, website, telegram_link, facebook, instagram, youtube, display_order`
- `videos` - Up to 3 video files (multipart/form-data)

---

## Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 201 | Created | Stage 1 successful |
| 200 | OK | Stages 2 & 3 successful |
| 400 | Bad Request | Invalid data format |
| 409 | Conflict | Username exists / Insufficient credits |
| 422 | Validation Error | Missing/invalid required fields |
| 404 | Not Found | User/Operator doesn't exist |
| 500 | Server Error | Unexpected error |

---

## Key Differences from Old API

### Old API (Single Step)
```
POST /enterprise/operator/create-employee
- Create complete employee in one call
- All fields required at once
- Less flexible
```

### New API (3 Stages)
```
Stage 1: POST /three-stage/employee/stage1
Stage 2: PUT /three-stage/employee/:id/stage2
Stage 3: PUT /three-stage/employee/:id/stage3

- Progressive data entry
- Can pause/resume process
- Better user experience
- Mobile-friendly workflow
```

---

## Implementation Checklist

For Frontend:
- [ ] Stage 1 form with telegram username input
- [ ] Error handling for duplicate username / insufficient credits
- [ ] Save userId after Stage 1
- [ ] Stage 2 form with profile fields (required + optional)
- [ ] Stage 3 form with company info + video uploads
- [ ] Success message after Stage 3
- [ ] Progress indicator (1/3, 2/3, 3/3)
- [ ] Back/cancel options at each stage
- [ ] Form validation before submission

For Backend:
- [x] Added creationStage field to User/Operator models
- [x] Implemented all 9 API endpoints (3 stages × 3 types)
- [x] Added route handlers
- [x] Audit logging for each stage
- [x] Validation and error handling
- [x] Credit deduction system
- [ ] Test all endpoints
- [ ] Document in Swagger/OpenAPI
- [ ] Update frontend calls

---

## Testing

### Test Credits Scenario
```bash
# Setup: Operator with 0 credits
# Expected: Stage 1 fails with 409 Insufficient credits
```

### Test Duplicate Username
```bash
# Setup: User "john_doe" exists
# Stage 1: POST with telegramUsername="john_doe"
# Expected: 409 Telegram username already registered
```

### Test Unauthorized Access
```bash
# Setup: Missing/invalid token
# Expected: 401/403 Unauthorized errors
```

### Test Cross-Operator Access
```bash
# Setup: Operator A tries to update employee.stage2 created by Operator B
# Expected: 404 Not found (permission check fails)
```

---

## Common Implementation Issues

### Issue: Cannot update Stage 2 after Stage 1
**Solution**: Make sure to save the `userId` from Stage 1 response

### Issue: Videos not uploading in Stage 3
**Solution**: Use `multipart/form-data` content type, not JSON

### Issue: Operator has no credits
**Solution**: Enterprise must assign credits using `/assign-credits` endpoint

### Issue: Getting validation errors
**Solution**: Check required fields match the field names in API docs exactly

---

## Database Indexes

To ensure good performance with the new feature:

```javascript
// User.js indexes
userSchema.index({ tgid: 1 });
userSchema.index({ username: 1 });
userSchema.index({ creationStage: 1 });
userSchema.index({ createdByOperator: 1 });

// Operator.js indexes
operatorSchema.index({ tgid: 1 });
operatorSchema.index({ username: 1 });
operatorSchema.index({ creationStage: 1 });
operatorSchema.index({ createdByEnterprise: 1 });
```

---

## Audit Trail

Every stage completion is logged in `EnterpriseAudit`:

```javascript
{
  actorType: "operator",
  actorId: "...",
  action: "employee.stage1",  // or stage2, stage3
  details: { /* relevant data */ },
  entityType: "User",
  entityId: "...",
  createdAt: ISODate
}
```

## Next Steps

1. Update frontend to use 3-stage process
2. Add progress indicators in UI
3. Implement form persistence (save draft)
4. Add stage skip/back functionality
5. Create admin dashboard to track creation status

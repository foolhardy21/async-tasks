# Version 1.2.0

Changelog
**Released** Jan 12, 2026

This version introduces a complete **event-driven order processing pipeline** with **event versioning**, **service-level consumers**, and a **central order aggregator**.  
It lays the foundation for reliable, decoupled order handling across payment, inventory, fraud detection, notifications, and cancellations.

## New Features

**1. Event Versioning**
- Added `event_version` to order-related Kafka events
- Consumers handle logic based on event version, enabling backward-compatible evolution

**2. Order Lifecycle via Kafka**
Introduced the following Kafka topics and flows:
- `order.created`
- `inventory.reserved`
- `payment.authorized`
- `order.ready`
- `order.cancelled`

Each service consumes and produces events independently.

## Database Changes

**New Table: `order_services`**
Tracks distributed order state:
- `order_id`
- `payment_status`
- `inventory_status`
- `expires_at`
- timestamps

## 🌐 API Additions

**Create Order**
- **Endpoint**: `POST /api/tasks/order/:userId`
- **Content-Type**: `application/json`
- **Fields**:
  - `userId` (string/number) — id of the user placing the order
- **Payload**:
  - `totalAmount`
  - `items`
  - `paymentMethodBin`
  - `deviceFingerprint`
- **Success response** (example):
  - `202 OK`
- **Error responses**:
  - `400 Bad Request` when validation fails
  - `500 Internal Server Error` for unexpected failures

# Version 1.1.0

Changelog
**Released** Dec 24, 2025

## New Features

 - **Multi-stage Queue Workflow**
Standard task queue → retry queue → dead-letter queue (DLQ)

 - **Retry Mechanism**
Automatic exponential backoff (e.g., 1s → 2s → 4s)

 - **Dead-Letter Queue (DLQ)**
Failed jobs after retries routed to DLQ

 - **Email Alerts**
Integration with Resend for notifications on DLQ failures 

 - **Optional Job Delays**
Support scheduling tasks to run in the future (processOn timestamps)

 - **Idempotency Fix**
Filename generation tied to userId to prevent duplicate uploads

# Version 1.0.0

Changelog
**Released** Nov 20, 2025

Initial release with basic thumbnail generation functionality.

 **API: Upload Image**
- **Endpoint**: `POST /api/tasks/upload-image`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file` (file) — the image being uploaded
  - `userId` (string/number) — id of the user to associate
- **Validation (current)**:
  - Accepts `image/jpeg` (server enforces MIME check in `multer` `fileFilter` and the validator).
  - If `req.file` is missing or the MIME is invalid the endpoint returns `400`.
- **Example curl**:
  - curl -X POST -F "file=@/path/to/photo.jpg" -F "userId=1" http://localhost:3000/api/tasks/upload-image

- **Success response** (example):
  - `200 OK` with JSON payload from the controller (implementation-specific)
- **Error responses**:
  - `400 Bad Request` when validation fails (missing file, invalid userId, invalid mimetype)
  - `500 Internal Server Error` for unexpected failures

**Background processing**
- After an upload, a worker runs `src/scripts/resizeImage.ts` which:
  - reads users without thumbnails from the DB,
  - resizes the uploaded image(s) to `300x300` using `sharp`,
  - writes thumbnails to `src/assets/users/thumbnail/` and sends results back to the parent.
- The parent listens for worker messages and updates DB rows (`thumbnailImage` field) when thumbnails are ready.


# Marketing Campaign Module Documentation

The Campaign Module handles the orchestration, scheduling, and multi-channel delivery of marketing communications (Email, SMS, and Web Push). It leverages a highly scalable queue-based system to reliably process thousands of messages.

---

## 🏛 Architecture

The module embraces an asynchronous **Orchestrator + Workers** design pattern for maximum scalability and fault tolerance.

### 1. The Gateway (API & Services)
- `CampaignController`: Accepts requests to create drafts and schedule campaigns.
- `CampaignService`: Manages business logic and inserts tasks into the queue with a scheduled delay.

### 2. The Queue Mechanism (BullMQ + Redis)
- Instead of using cron jobs or timeouts—which fail on server shutdowns—scheduled campaigns are inserted into a Redis queue using `BullMQ` with a highly precise `delay`.
- **How Delay Works:** When `scheduleCampaign` is called, the system calculates the math: `delay = targetTime - Date.now()`. BullMQ takes this job and stores it in a special "delayed" set in Redis. It efficiently waits in the background using Redis's optimized sorted sets. It places zero load on Node.js while it waits, safely surviving any server restarts.
- The job gets picked up automatically by the processor precisely when the `scheduleTime` arrives.

### 3. The Processor (Workers)
The `CampaignProcessor` acts as the worker and has two main responsibilities:
- **Phase A (`start-campaign`)**: Fetches the target `Audience` for the campaign and rapidly breaks it down into individual tasks. It pushes a `send-message` job onto the queue for *every single user*.
- **Phase B (`send-message`)**: Picks up individual messages, checks the campaign type (Email/SMS/Push), interacts with the relevant infrastructure service (`MailService`, `SmsService`, `PushService`), and creates a `CampaignLogEntity` to record success or failure.

---

## 💾 Data Models

- **`CampaignEntity`**: The core record. Tracks `type` (EMAIL, SMS, PUSH), `status` (DRAFT, SCHEDULED, RUNNING, COMPLETED), and metrics (`totalAudience`, `sentCount`, `failedCount`).
- **`CampaignMessageEntity`**: The payload. Stores different variations depending on type:
  - Email: `subject`, `htmlContent`, `text`
  - SMS: `text`
  - Push: `title`, `body`, `imageUrl`
- **`CampaignLogEntity`**: The audit trail. Every individual dispatch attempt is tracked here, pinpointing exactly who received what and where it failed.

---

## 🚀 Lifecycle of a Campaign

1. **Drafting**: Admin creates a new campaign and assigns the content. Status: `DRAFT`.
2. **Scheduling**: Admin selects a future (or immediate) `scheduleTime`. Service calculates delay `(scheduleTime - Date.now())` and pushes to BullMQ. Status: `SCHEDULED`.
3. **Triggering**: BullMQ invokes the processor. Processor changes status to `RUNNING`, counts the audience, and queues the blast.
4. **Delivery**: Workers simultaneously process the individual jobs, executing the delivery.
5. **Completion**: As logs are recorded, the processor increments `sentCount` and `failedCount`. Once `sentCount + failedCount >= totalAudience`, the status automatically switches to `COMPLETED`.

---

## 🔗 Extensibility (Adding New Channels)

If you need to add a new channel in the future (e.g., WhatsApp Business):

1. **Enum**: Add `WHATSAPP` to `CampaignType`.
2. **Entity**: Add any specific fields to `CampaignMessageEntity` (e.g., `whatsappTemplateId`).
3. **Processor**: Inside `CampaignProcessor.handleSendMessage()`, add a new `else if(campaign.type === CampaignType.WHATSAPP)` block that invokes your new `WhatsappService`.
4. **Audience**: Ensure `AudienceService` fetches the user's WhatsApp number.

---

## 💡 Notes for Debugging

- If campaigns are stuck in `SCHEDULED`, ensure the `Redis` container is running and `BullModule` is correctly connecting to it.
- Failures on individual deliveries do *not* crash the campaign. They are quietly skipped, logged as `FAILED` in `campaign_logs`, and immediately visible in the admin stats dashboard.

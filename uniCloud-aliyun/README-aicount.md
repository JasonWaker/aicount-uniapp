# AI Countdown uniCloud Backend

Target space: `aidayscount` on uniCloud Aliyun.

## Collections

- `aicount_user_profiles`: user profile extension for uni-id users
- `aicount_vip_subscriptions`: Pro/VIP subscription state
- `aicount_payment_orders`: payment orders
- `aicount_books`: default and custom countdown books
- `aicount_book_orders`: user book order snapshots
- `aicount_events`: countdown events
- `aicount_event_ai_tasks`: AI task breakdown
- `aicount_event_timeline`: event timeline records
- `aicount_event_photos`: timeline photos
- `aicount_event_reminders`: event reminder settings
- `aicount_posters`: poster/share image config
- `aicount_templates`: background and poster templates
- `aicount_icons`: icon dictionary
- `aicount_messages`: reserved persistent messages
- `aicount_message_reads`: message read states
- `aicount_feedbacks`: user feedback
- `aicount_ai_logs`: AI provider call logs
- `aicount_user_settings`: notification and privacy settings

## Cloud Objects

- `aicount-user`: profile and VIP read helpers
- `aicount-book`: book list/create/update/delete/order
- `aicount-event`: event list/detail/create/update/delete/timeline/tasks
- `aicount-ai`: calls `deepseek-ai` and writes AI logs, with local fallback
- `aicount-payment`: creates Pro orders and supports mock pay success
- `aicount-message`: builds message center items from real events
- `aicount-feedback`: submits feedback
- `aicount-setup`: checks and safely fills default init data

## Upload Order

1. Bind this project to the `aidayscount` service space in HBuilderX.
2. Upload all collection schemas under `uniCloud-aliyun/database`.
3. Import init data for `aicount_books`, `aicount_icons`, and `aicount_templates`.
4. Upload cloud objects under `uniCloud-aliyun/cloudfunctions`.
5. Configure `DEEPSEEK_API_KEY` for the existing `deepseek-ai` cloud function.
6. Optional: configure `AICOUNT_SETUP_KEY` for `aicount-setup` if you want to fill missing init data from the app/console.

## Frontend Entry

Use `services/cloud-api.js`:

```js
const cloudApi = require("@/services/cloud-api")

const events = await cloudApi.event().list()
const books = await cloudApi.book().list()
```

The current app can still run on local storage. Replace local storage modules gradually with these cloud objects.

## Init Data Check

After uploading `aicount-setup`, you can check whether default data exists:

```js
const setup = uniCloud.importObject("aicount-setup")
const state = await setup.checkInitData()
console.log(state)
```

If the init data was not imported manually, configure `AICOUNT_SETUP_KEY` on the `aicount-setup` cloud object and run:

```js
await setup.ensureInitData("your-setup-key")
```

Remove or rotate `AICOUNT_SETUP_KEY` after initialization.

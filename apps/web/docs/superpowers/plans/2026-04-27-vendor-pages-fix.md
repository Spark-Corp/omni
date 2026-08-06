# Vendor Pages Fix Plan

> **For agentic workers:** Use subagent-driven-development to implement task-by-task.

**Goal:** Fix all incomplete vendor pages for competition demo.

---

## Task 1: Dashboard - Add Real Stats + Cleanup

**Files:** `src/app/vendor/dashboard/page.jsx`

- Remove unused imports (Package, MessageCircle, TrendingUp, Edit)
- Add API call to get real request/message counts
- Add stats cards showing:
  - Requests today (from `/api/vendors/requests`)
  - Messages (from `/api/vendors/conversations`)

---

## Task 2: Products Page - Add Category + Error Display

**Files:** `src/app/vendor/products/page.jsx`

- Add category field to form (optional, for organization)
- Show error messages to users (not just console.log)
- Fix unit dropdown consistency

---

## Task 3: Requests Page - Verify Working

**Files:** `src/app/vendor/requests/page.jsx`

- Check API integration works
- Verify accept/deny functionality
- Fix any issues found

---

## Task 4: Messages Page - Verify Working

**Files:** `src/app/vendor/messages/page.jsx`

- Check API integration works
- Verify chat display
- Fix any issues found

---

## Task 5: API Enhancement - Add Stats Endpoint

**Files:** `src/app/api/vendors/stats/route.js` (NEW)

Create endpoint to get vendor stats:
- Total requests
- Pending requests
- Total messages
- This enables dashboard stats
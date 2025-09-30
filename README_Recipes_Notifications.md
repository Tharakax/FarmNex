# FarmNex Feature Guide: Recipes and Notifications

This document provides a complete overview of the Recipes and Notifications features in FarmNex, including:
- File structure (frontend and backend)
- Frontend components, pages, and flows
- Backend models, controllers, and routes
- API endpoints (with payloads and expected responses)
- Configuration and behaviors
- Tips and testing notes


## Table of Contents
- [File Structure](#file-structure)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Notifications Feature](#notifications-feature)
  - [Overview](#overview)
  - [Frontend](#frontend-1)
  - [Backend](#backend-1)
  - [API Endpoints](#api-endpoints)
  - [Behavior and State Persistence](#behavior-and-state-persistence)
  - [Testing Tips](#testing-tips)
- [Recipes Feature](#recipes-feature)
  - [Overview](#overview-1)
  - [Frontend](#frontend-2)
  - [Backend](#backend-2)
  - [API Endpoints](#api-endpoints-1)
  - [Data Model](#data-model)
  - [Testing Tips](#testing-tips-1)
- [Configuration](#configuration)


## File Structure

### Frontend

- src/pages/Recipes and Notifications pages
  - frontend/src/pages/Recipes.jsx
  - frontend/src/pages/notifications/AddNotification.jsx
  - frontend/src/pages/notifications/NotificationList.jsx
  - frontend/src/pages/notifications/UpdateNotification.jsx

- Recipes feature components
  - frontend/src/features/recipes/AddRecipe.jsx
  - frontend/src/features/recipes/UpdateRecipe.jsx
  - frontend/src/features/recipes/RecipeList.jsx
  - frontend/src/features/recipes/RecipeItem.jsx
  - frontend/src/features/recipes/RecipesPanel.jsx
  - frontend/src/features/recipes/StarRating.jsx

- Notifications feature components
  - frontend/src/features/notifications/NotificationBell.jsx
  - frontend/src/features/notifications/NotificationItem.jsx
  - frontend/src/features/notifications/NotificationManager.jsx
  - frontend/src/features/notifications/UserNotifications.jsx
  - frontend/src/features/notifications/FarmerNotifications.jsx

- Navigation integration (where bells/pages are surfaced)
  - frontend/src/pages/user/Home/Home.jsx
  - frontend/src/pages/user/Home/AdminDash.jsx
  - frontend/src/pages/farmerdashboard.jsx

- Services
  - frontend/src/services/notificationAPI.js

- App routes
  - frontend/src/App.jsx
    - /recipes, /recipes/manage, /recipes/add, /recipes/edit/:id
    - /notifications, /notifications/add, /notifications/edit/:id


### Backend

- Notifications
  - backend/controllers/NotificationControllers.js
  - backend/routers/NotificationRoute.js
  - Note: Notification model is referenced as "NotificationModel.js" within controllers; ensure model file exists and is wired in your backend index.js

- Recipes
  - backend/models/recipe.js
  - backend/controllers/recipeController.js
  - backend/routers/recipeRouter.js


## Notifications Feature

### Overview
FarmNex delivers role-targeted notifications (USER/Customer, FARMER, ADMIN) with a modern notification bell UI. The bell shows an unread badge count that updates instantly when clicked, persists across refreshes, and is resilient to backend timing.

Key behaviors:
- Badge count decrements to 0 immediately on bell click for instant feedback
- Count remains 0 until truly new notifications arrive (created after your click)
- Read/seen states are tracked locally and via backend endpoints


### Frontend

Core files:
- Notification bell and dropdown: frontend/src/features/notifications/NotificationBell.jsx
- Individual item rendering: frontend/src/features/notifications/NotificationItem.jsx
- Management pages (admin/editor):
  - Add: frontend/src/pages/notifications/AddNotification.jsx
  - List: frontend/src/pages/notifications/NotificationList.jsx
  - Update: frontend/src/pages/notifications/UpdateNotification.jsx

Routing (frontend/src/App.jsx):
- /notifications → NotificationList
- /notifications/add → AddNotification
- /notifications/edit/:id → UpdateNotification

Service (frontend/src/services/notificationAPI.js):
- Encapsulates REST calls to backend

Audience mapping used in NotificationBell.jsx:
- farmer → FARMER audience
- customer/user → USER audience
- admin → ADMIN audience
- ALL/BOTH serve all applicable roles


### Backend

- Router: backend/routers/NotificationRoute.js
- Controller: backend/controllers/NotificationControllers.js

Notable controller functions:
- getAllNotifications
- addNotifications
- getById
- updateNotification
- deleteNotification
- getNotificationsByRole (also used for /audience/:audience)
- getNotificationStats
- markNotificationAsRead (per-user read tracking)
- markAllNotificationsAsRead
- getUnreadCount


### API Endpoints
Base path: /api/notifications

- GET /api/notifications
  - Returns: { notifications: Notification[] }

- POST /api/notifications
  - Body: { title, body, audience, type?, priority?, sendEmail? }
  - Returns: { notification, emailStatus? }

- GET /api/notifications/:NotificationId
  - Returns: { notification }

- PUT /api/notifications/:NotificationId
  - Body: { title, body, audience, type?, priority?, sendEmail? }
  - Returns: { notification, emailStatus? }

- DELETE /api/notifications/:NotificationId
  - Returns: { message, notification }

- GET /api/notifications/role/:role
  - role ∈ { farmer, user, admin }
  - Returns: { notifications, meta }

- GET /api/notifications/audience/:audience
  - audience ∈ { FARMER, USER, ADMIN, BOTH, ALL }
  - Alias to role-based retrieval with enriched metadata

- GET /api/notifications/stats/:role
  - Returns count by types, priorities, last 7 days, etc.

- PATCH /api/notifications/:NotificationId/read
  - Body: { userId }
  - Marks a single notification as read for a specific user

- PATCH /api/notifications/read-all
  - Body: { userId, audience? }
  - Marks all role/audience-matching notifications as read for a user

- GET /api/notifications/unread-count?userId=...&audience=...
  - Returns: { count, unreadCount }


### Behavior and State Persistence

NotificationBell.jsx implements robust state handling for a responsive UX:
- Immediate feedback: when the bell opens, if unreadCount > 0 it becomes 0 immediately.
- Local state and persistence:
  - Read set: notif:read:<userId>
  - Seen set: notif:seen:<userId>
  - Last-cleared timestamp: notif:cleared:<userId>
- Guard against refetch overrides: a one-shot guard ensures the immediate fetch after click doesn’t re-introduce the count.
- Persisted last-cleared timestamp ensures any notification created at or before the click time won’t count as unread, even after refreshes. Only newer notifications will increment the badge.

UX notes:
- Badge shows up to 99+.
- Animations: bell scales on open, badge may animate on open.
- Accessible: title tooltips and focus styling.


### Testing Tips
- Verify with multiple roles (USER/CUSTOMER, FARMER, ADMIN) to ensure audience filtering.
- Simulate new notifications after opening the bell to confirm badge increments for truly new ones only.
- Validate read-all behavior: clicking “Mark all as read” should zero the badge and persist the timestamp.
- Network/offline: component gracefully falls back to mock notifications if the backend is unavailable.


## Recipes Feature

### Overview
The Recipes feature provides browsing, adding, updating, and management of recipes. Recipes support titles, descriptions, images, ingredients, type (Vegetarian/Non-Vegetarian), meal tags, estimated time, and rating. Backend uses an auto-incrementing numeric recipeId for human-friendly references.


### Frontend

Core files:
- Entry page: frontend/src/pages/Recipes.jsx
- Management UI:
  - AddRecipe: frontend/src/features/recipes/AddRecipe.jsx
  - UpdateRecipe: frontend/src/features/recipes/UpdateRecipe.jsx
  - RecipeList: frontend/src/features/recipes/RecipeList.jsx
  - RecipeItem: frontend/src/features/recipes/RecipeItem.jsx
  - RecipesPanel: frontend/src/features/recipes/RecipesPanel.jsx
  - StarRating: frontend/src/features/recipes/StarRating.jsx

Routing (frontend/src/App.jsx):
- /recipes → Recipes (public/browse)
- /recipes/manage → RecipeList (management view)
- /recipes/add → AddRecipe
- /recipes/edit/:id → UpdateRecipe

Typical flows:
- Browse recipes on /recipes
- Manage list (search/sort/paginate) on /recipes/manage
- Add/edit via dedicated forms (title, description, image, ingredients, type, meal, time, rating)


### Backend

- Model: backend/models/recipe.js
- Controller: backend/controllers/recipeController.js
- Router: backend/routers/recipeRouter.js


### API Endpoints
Base path: /api/recipes

- GET /api/recipes
  - Returns: { success: true, recipes: Recipe[] } sorted by createdAt desc

- GET /api/recipes/:id
  - Returns: { success: true, recipe }

- POST /api/recipes
  - Body fields:
    - title: string (required)
    - description: string (required)
    - image: string (optional)
    - ingredients: string[] or comma-separated string (optional)
    - type: 'Vegetarian' | 'Non-Vegetarian' (default: 'Vegetarian')
    - meal: string[] or comma-separated string (optional)
    - time: string (optional, e.g., "30 mins")
    - rating: number (0–5, optional)
  - Returns: { success: true, recipe }

- PUT /api/recipes/:id
  - Body: any subset of fields above; ingredients/meal can be arrays or comma-separated strings
  - Returns: { success: true, recipe }

- DELETE /api/recipes/:id
  - Returns: { success: true, message: 'Recipe deleted' }


### Data Model

backend/models/recipe.js
- recipeId: Number (auto-increment, unique, indexed)
- title: String (required)
- description: String (required)
- image: String (optional)
- ingredients: String[] (default [])
- type: 'Vegetarian' | 'Non-Vegetarian' (default 'Vegetarian')
- meal: String[] (default [])
- time: String (e.g., "30 mins")
- rating: Number (0–5)
- timestamps: createdAt, updatedAt
- Index: text index on title, description, ingredients for flexible search

Auto-increment implementation:
- A Counter collection (key: 'recipeId') is used to generate sequential recipeId values on insert via a pre-save hook.


### Testing Tips
- Validate both array and comma-separated string inputs for ingredients and meal.
- Confirm duplicate handling: the controller returns an error for duplicate keys (e.g., rare collisions).
- Exercise the text index via search in list pages if implemented.
- Verify media (image) handling if applicable to your environment/storage.


## Configuration

Frontend
- notificationAPI uses VITE_BACKEND_URL if set; otherwise defaults to http://localhost:3000.
  - Set in your environment: VITE_BACKEND_URL=http://localhost:3000

Backend
- Ensure notification and recipe routers are mounted under /api/notifications and /api/recipes respectively in your server’s main file.
- Ensure the Notification model file exists and matches the fields referenced by NotificationControllers.js (title, body, audience, type, priority, readBy, createdAt, etc.).


---
If you want this document moved to docs/ or split into separate READMEs (Recipes.md, Notifications.md), let us know and we’ll organize it accordingly.

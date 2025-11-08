# BTL Cloud Functions

A comprehensive backend service built with Firebase Cloud Functions for a social messaging application. This project provides a serverless architecture for handling real-time messaging, analytics, AI-powered features, and user engagement.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Scheduled Functions](#scheduled-functions)
- [Contributing](#contributing)
- [License](#license)

## Overview

BTL Cloud Functions is the backend service for a social messaging platform that leverages Google Cloud technologies, AI/ML services, and real-time communication tools. The system handles user management, content moderation, analytics reporting, push notifications, and AI-powered interactions.

## Features

### 🔐 User Management
- User authentication and authorization
- Profile management
- User activity tracking
- Account deletion and management

### 💬 Real-time Messaging
- Integration with ConnectyCube for real-time chat
- Twilio messaging support
- Message analytics and reporting

### 🤖 AI-Powered Features
- GPT-based content generation and conversation creation
- BERT model integration for content classification
- Post ranking and tagging suggestions
- Love message generation
- Topic and tag suggestions

### 📊 Analytics & Reporting
- Google Analytics integration
- BigQuery data processing
- Cohort analysis
- User engagement metrics
- Content performance tracking

### 🔔 Notifications
- Push notifications via FCM
- Scheduled daily notifications
- User activity-based notifications
- Stale token management

### 🛡️ Content Moderation
- Perspective API integration for toxicity detection
- Video content analysis with Google Video Intelligence
- Flagged content management

### 🤖 Bot Systems
- Automated user and content generation
- Bot account management
- Scheduled bot interactions

### 📱 Social Media Integration
- TikTok API services
- Instagram scraping capabilities
- Snapchat scraping tools

## Architecture

The project follows a serverless microservices architecture using Firebase Cloud Functions with these key components:

- **Event-Driven Design**: Triggered by database changes, HTTP requests, or scheduled events
- **Modular Structure**: Separated into `common`, `features`, `tasks`, `triggers`, and `utils`
- **Layered Approach**: Clear separation between business logic, services, and infrastructure

### Design Patterns
- **Service Facade**: Each module exposes a service interface
- **Strategy Pattern**: For different notification types
- **Factory Pattern**: In bot/user generators
- **Observer Pattern**: Implemented via Firebase function triggers

## Technology Stack

### Core Technologies
- **Firebase Cloud Functions** (Node.js 18)
- **Firebase Firestore** for database
- **Firebase Authentication** for user management

### Google Cloud Services
- **Google Analytics Data API** v4.3.0
- **Google BigQuery** v7.3.0
- **Google Video Intelligence API** v5.3.0
- **Google Auth Library** v9.4.2
- **Google APIs** v82.0.0

### Third-Party Integrations
- **ConnectyCube** v3.27.4 - Real-time chat platform
- **OpenAI** v4.24.7 - GPT API integration
- **Cheerio** v1.0.0-rc.12 - Server-side jQuery for scraping
- **Twilio** - SMS and messaging services
- **App Store Server API** v0.11.1 - iOS subscription management

### Utilities
- **Moment.js** v2.30.1 - Date/time handling
- **Axios** v1.6.5 - HTTP client
- **Dotenv** v17.2.3 - Environment variable management

## Project Structure

```
functions/
├── common/                 # Shared business logic and services
│   ├── gpt-services/      # GPT integration for AI features
│   ├── rest-api-services/ # HTTP service integrations
│   └── tiktok-api-services/ # TikTok API integration
├── features/              # High-level domain features
│   ├── analytics-sheet/   # Analytics and reporting
│   ├── bots/              # Bot generation systems
│   ├── google-apis/       # Google service integrations
│   ├── hugging-face/      # BERT model integration
│   ├── location/          # Location services
│   ├── notifications/     # Notification systems
│   ├── pubsub/            # Pub/Sub messaging
│   └── scraping/          # Social media scraping
├── triggers/              # Firebase event triggers
│   ├── users/            # User-related triggers
│   ├── posts/            # Post-related triggers
│   ├── notifications/    # Notification triggers
│   └── ...               # Other event triggers
├── tasks/                 # Scheduled and background tasks
│   ├── analytics_tasks/  # Analytics processing
│   ├── firebase_notification/ # Firebase notifications
│   └── ...               # Other task types
└── utils/                 # Helper functions and validators
```

## Setup and Installation

### Prerequisites
- Node.js 18.x
- Firebase CLI
- Google Cloud SDK
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Majid760/gaya-cloud_function.git
cd btl-cloud-functions
```

2. Install dependencies:
```bash
cd functions
npm install
```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Initialize Firebase:
```bash
firebase login
firebase use --add
```

## Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
# ConnectyCube credentials
CC_APP_ID=your_app_id
CC_AUTH_KEY=your_auth_key
CC_AUTH_SECRET=your_auth_secret

# API Keys
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_api_key

# Backend configuration
BASE_URL_PROD=your_production_url
```

Sensitive credentials should be stored as environment variables and never committed to the repository.

## Deployment

### Local Development
```bash
# Start Firebase emulators
npm run serve

# Run functions shell
npm run shell
```

### Deploy to Firebase
```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific functions
firebase deploy --only functions:functionName
```

### Testing
```bash
# Run tests
npm test
```

## API Endpoints

### HTTP Functions
- `POST /getLocation` - Get user location information
- `POST /generateTags` - Generate tags for content
- `POST /createConversationGenerate` - Create AI-powered conversations
- `POST /callVideoAnalysis` - Analyze video content

### Callable Functions
- `girlzBestieBotMessageHttp` - Handle bot messages
- `disableUserByUid` - Disable user accounts
- `createPostAPI` - Create new posts
- `sendTaskNotificationOnNoMessageResponse` - Send notifications for unanswered messages

## Scheduled Functions

### Daily Analytics
- `sendDailyAnalytics` - Updates Google Sheets with daily analytics at 11:50 PM (Israel time)
- `sendWeeklyAnalytics` - Updates Google Sheets with weekly analytics every Sunday at 11:50 PM

### User Notifications
- `sendDailyNotification` - Sends daily notifications at 5:00 PM
- `sendDailySomeOneNeedHelpNotification` - Sends help notifications every 3 days at 10:00 PM
- `sendDailySeekingAdviceNotification` - Sends advice notifications every 3 days at 8:00 PM
- `sendDailyShareYourDayNotification` - Sends share notifications every 4 days at 6:00 PM
- `sendDailyOnNewPostNotification` - Sends new post notifications every 4 days at 4:00 PM

### User Activity
- `scheduleUserActivityBasedNotifications` - Enqueues notifications for all users daily at 1:00 AM (Israel time)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is proprietary and confidential. All rights reserved.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Below is an initial documentation outline for an MVP version of a Personal AI Assistant Agent that uses LangChain, Azure OpenAI, and integrates with Google Calendar. This document is meant to serve as a living guide for developers and stakeholders as the project evolves.

---

# Personal AI Assistant Agent

https://github.com/user-attachments/assets/497ee0d9-6ff4-47b1-9483-5ac9ed174bf8

## Project Title
Personal AI Assistant Agent

## Introduction
This project is an intelligent personal assistant that helps users manage their tasks and schedules. The assistant processes natural language inputs to create and schedule tasks directly on Google Calendar, providing a seamless experience for personal productivity management.

## Problem Statement
In today's fast-paced digital environment, people struggle to efficiently manage their tasks and schedules across multiple platforms. Current solutions often require manual input in specific formats or navigating complex interfaces. This project addresses this challenge by creating an AI-powered assistant that understands natural language instructions and seamlessly integrates with calendar systems, reducing cognitive load and improving productivity.

## Objectives
- To create an intuitive AI assistant that understands and processes natural language task instructions
- To seamlessly integrate with Google Calendar for scheduling management
- To provide clarification when task details are ambiguous
- To streamline the process of task creation and management

## Technology Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **AI/ML**: Azure OpenAI, LangChain
- **Integrations**: Google Calendar API
- **Development**: TypeScript
- **Deployment**: Vercel

## Installation Instructions
### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Azure OpenAI API key
- Google Cloud Platform account with Calendar API enabled

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/dxulet/personal-ai-agent.git

# 2. Navigate into the project directory
cd personal-ai-agent

# 3. Install dependencies
npm install
# or
yarn install

# 4. Set up environment variables
# Create a .env.local file with the following:
# AZURE_OPENAI_API_KEY=your_api_key
# GOOGLE_CLIENT_ID=your_client_id
# GOOGLE_CLIENT_SECRET=your_client_secret

# 5. Start the development server
npm run dev
# or
yarn dev
```

## Usage Guide
1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Authenticate with your Google account to enable calendar integration
3. Type natural language instructions in the chat interface, for example:
   - "Schedule a meeting with John tomorrow at 2 PM"
   - "Remind me to call Mom on Friday"
   - "Block 3 hours for focused work next Monday morning"
4. The assistant will process your request and either:
   - Create the event directly if all information is clear
   - Ask clarifying questions if details are missing or ambiguous
5. Once confirmed, the event will appear in your Google Calendar

## Known Issues / Limitations
- Currently only supports Google Calendar integration
- Limited to English language instructions
- Time zone handling may require additional configuration
- Free-form natural language parsing may occasionally misinterpret complex instructions

## References
- [Next.js Documentation](https://nextjs.org/docs)
- [Azure OpenAI Service](https://azure.microsoft.com/en-us/services/cognitive-services/openai-service/)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [Google Calendar API](https://developers.google.com/calendar)

## Team Members
- Daulet Ashikbayev, 220101005, 16-P

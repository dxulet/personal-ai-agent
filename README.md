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

# Personal AI Assistant Agent MVP Documentation

## 1. Overview

### 1.1. Project Vision
- **Goal:** Develop a minimal viable product (MVP) that assists users in managing their tasks and schedules. The assistant will process natural language inputs to create and schedule tasks directly on Google Calendar.
- **Core Technologies:**
  - **LangChain:** For orchestrating language model prompts, chaining calls, and handling the conversation flow.
  - **Azure OpenAI:** To power the underlying language model and understand/process user instructions.
  - **Google Calendar API:** For scheduling and managing tasks as calendar events.
  - **Next.js:** For building the web interface and API endpoints.

### 1.2. Key Features
- **Task Management:** Interpret user input to extract tasks and relevant details (date, time, description).
- **Calendar Integration:** Create, update, and delete calendar events on Google Calendar.
- **Conversational Flow:** Utilize natural language processing to clarify ambiguous tasks and ensure correct scheduling.

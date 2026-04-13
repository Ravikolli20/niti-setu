# Niti Setu Server

AI-powered eligibility backend for farmers, built for hackathon speed and real-world impact.

Niti Setu helps answer a practical question for rural households: Which government schemes am I eligible for, and why? This backend ingests official scheme PDFs, performs retrieval over policy text, and returns explainable eligibility outcomes through secure APIs.

## Problem Statement

Farmers often struggle with:

- fragmented scheme information spread across long documents
- confusion around eligibility criteria
- no personalized, explainable recommendation flow

This project solves that by combining:

- profile-based eligibility checks
- document-grounded AI reasoning (RAG)
- secure authentication with session controls

## Hackathon Pitch

Why this project stands out:

- clear social impact: improves access to welfare programs
- practical architecture: Express + MongoDB + RAG pipeline
- secure by design: JWT access tokens, refresh rotation, token revocation, role-based authorization
- demo friendly: simple endpoint flow from signup to profile to eligibility result

## Core Features

- Authentication and authorization
  - signup, login, refresh, logout, identity endpoint
  - bcrypt-hashed passwords in database
  - refresh token rotation and revocation
- Farmer profile management
  - create or update profile
  - fetch current user profile
- Scheme and ingestion module
  - list schemes
  - upload new scheme PDFs (admin only)
  - view chunk status per scheme
- Eligibility engine
  - profile-driven evaluation against ingested scheme knowledge
  - explainable output from AI chain

## Tech Stack

- Runtime: Node.js, TypeScript, Express
- Database: MongoDB
- Security: jsonwebtoken, bcryptjs
- AI and retrieval: pdf-parse, Xenova Transformers, Google/LLM integrations
- Tooling: ESLint, ts-node-dev

## Project Structure

```text
src/
	app.ts
	index.ts
	controllers/
	routes/
	services/
		rag/
	models/
	utils/
```

## API Overview

Base path: /api

Health:

- GET /health

Auth:

- POST /auth/signup
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET /auth/me

Profile (authenticated):

- POST /profile
- GET /profile/me

Eligibility (authenticated):

- POST /eligibility

Schemes:

- GET /schemes
- GET /schemes/:id/chunks (authenticated)
- POST /schemes/upload (authenticated + admin)

## Environment Variables

Create a local environment file from the example and fill values.

Required variables:

- PORT
- MONGO_URI
- LLM_API_KEY
- GOOGLE_API_KEY
- MODEL_NAME
- JWT_SECRET
- JWT_EXPIRES_IN
- JWT_REFRESH_SECRET
- JWT_REFRESH_EXPIRES_IN

Example values are already present in .env.example.

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

- copy .env.example to .env
- set MongoDB URI and JWT secrets

3. Run in development mode

```bash
npm run dev
```

4. Build for production

```bash
npm run tsc
```

5. Start built server

```bash
npm run start
```

## Demo Flow for Judges

Use this sequence during live demo:

1. POST /api/auth/signup
2. POST /api/auth/login
3. POST /api/profile with farmer details
4. GET /api/profile/me to show stored profile
5. POST /api/eligibility to show personalized results
6. GET /api/schemes to show data foundation

Optional security demo:

1. wait for access token expiry
2. call protected endpoint and show 401
3. POST /api/auth/refresh
4. retry protected endpoint successfully

## Security Notes

- Passwords are stored as bcrypt hashes, never plaintext
- Refresh tokens are rotated and revocable
- Refresh token records are indexed for expiry and lookup
- Role checks protect upload/admin operations

## Team Notes

This backend is designed for fast iteration in a hackathon while keeping production-minded security and architecture foundations.

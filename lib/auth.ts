import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

// MONGODB_URL অথবা MONGODB_URI
const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/bazardor";

const g = globalThis as unknown as { _mongo?: MongoClient };
const client = g._mongo ?? new MongoClient(mongoUri, {
  connectTimeoutMS: 20000,
  socketTimeoutMS: 45000,
});

if (process.env.NODE_ENV !== "production") {
  g._mongo = client;
}

// Google Credentials 
const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.BETTER_AUTH_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET;

// GitHub Credentials 
const githubClientId = process.env.GITHUB_CLIENT_ID || process.env.BETTER_AUTH_GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || process.env.BETTER_AUTH_GITHUB_SECRET;

const social: Record<string, { clientId: string; clientSecret: string }> = {};

if (googleClientId && googleClientSecret) {
  social.google = { clientId: googleClientId, clientSecret: googleClientSecret };
}

if (githubClientId && githubClientSecret) {
  social.github = { clientId: githubClientId, clientSecret: githubClientSecret };
}

export const auth = betterAuth({
  database: mongodbAdapter(client.db("bazardor")),
  emailAndPassword: { enabled: true, autoSignIn: false, minPasswordLength: 8 },
  socialProviders: social,
  plugins: [nextCookies()],
  secret: process.env.BETTER_AUTH_SECRET || "super-secret-bazar-dor-key-2026",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
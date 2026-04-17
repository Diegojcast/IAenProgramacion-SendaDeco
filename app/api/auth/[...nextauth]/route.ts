/**
 * NextAuth.js v5 route handler.
 * Handles: GET/POST /api/auth/*  (sign-in, sign-out, callback, session, csrf)
 */
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers

// In-memory session state, keyed by phone number. Resets if the server
// restarts — fine for a demo, but once you add Prisma/Supabase (Section 3
// of the spec), replace this with the Conversation/Message tables so state
// survives restarts and works across multiple server instances.

type AwaitingType = "location" | "crop" | null;

const sessions = new Map<string, AwaitingType>();

export function getAwaiting(phone: string): AwaitingType {
  return sessions.get(phone) ?? null;
}

export function setAwaiting(phone: string, awaiting: AwaitingType) {
  sessions.set(phone, awaiting);
}

export function clearAwaiting(phone: string) {
  sessions.delete(phone);
}

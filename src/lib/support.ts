export const TICKET_CATEGORIES = [
  { id: "automation", label: "Automation / DMs" },
  { id: "instagram", label: "Instagram connection" },
  { id: "storefront", label: "Storefront" },
  { id: "billing", label: "Billing" },
  { id: "other", label: "Other" },
] as const;

export const categoryLabel = (id: string) => TICKET_CATEGORIES.find((c) => c.id === id)?.label ?? "General";

// Short, readable reference for a ticket uuid.
export const ticketRef = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

export const SUBJECT_MAX = 120;
export const MESSAGE_MAX = 5000;

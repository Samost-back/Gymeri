export type MembershipStatus = "upcoming" | "active" | "ending_soon" | "used_up" | "expired";

// A plan of the chosen gym, offered to prefill a new membership.
export type GymPlan = {
  name: string;
  durationDays: number;
  // Null means unlimited visits.
  visitsLimit: number | null;
  price: number;
  // Who may buy it, e.g. «Студенти»; empty means everyone.
  audiences: string[];
};

export type MyGym = {
  slug: string;
  name: string;
  chainName: string;
  address: string;
  hoursSummary: string;
  isOpenNow: boolean;
  photoUrl: string | null;
  plans: GymPlan[];
};

// Counted by the backend; the page only shows it.
export type MembershipCard = {
  id: number;
  gymSlug: string;
  gymName: string;
  name: string;
  price: number;
  // ISO dates; endsOn is the last day it still works.
  startsOn: string;
  endsOn: string;
  status: MembershipStatus;
  daysLeft: number;
  // All three are null for a membership that doesn't count visits.
  visitsLimit: number | null;
  visitsUsed: number | null;
  visitsLeft: number | null;
  visitedToday: boolean;
};

export type Account = {
  // Null until a gym is chosen, or when the chosen gym has left the catalog.
  gym: MyGym | null;
  memberships: MembershipCard[];
};

export type NewMembership = {
  name: string;
  price: number;
  durationDays: number;
  visitsLimit: number | null;
  startsOn: string;
};

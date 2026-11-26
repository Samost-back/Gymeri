import { request } from "@/shared/lib/clientApi";
import type { Account, MembershipCard, MyGym, NewMembership } from "../model/types";

// Backend contract (snake_case, decimals as strings); mapped once here for the UI. The gym
// comes in the public gym page's shape; only the fields the account shows are read.
type MyGymDto = {
  slug: string;
  name: string;
  chain_name: string;
  address: string;
  hours_summary: string;
  is_open_now: boolean;
  photos: { url: string }[];
  plans: {
    name: string;
    duration_days: number;
    visits_limit: number | null;
    price: string;
    audiences: { name: string }[];
  }[];
};

type MembershipCardDto = {
  id: number;
  gym_slug: string;
  gym_name: string;
  name: string;
  price: string;
  starts_on: string;
  ends_on: string;
  status: MembershipCard["status"];
  days_left: number;
  visits_limit: number | null;
  visits_used: number | null;
  visits_left: number | null;
  visited_today: boolean;
};

type AccountDto = { gym: MyGymDto | null; memberships: MembershipCardDto[] };

// The order the form shows its fields in, so the first error points at the first field.
const MEMBERSHIP_FIELDS = ["name", "price", "duration_days", "visits_limit", "starts_on"];

function toGym(gym: MyGymDto): MyGym {
  return {
    slug: gym.slug,
    name: gym.name,
    chainName: gym.chain_name,
    address: gym.address,
    hoursSummary: gym.hours_summary,
    isOpenNow: gym.is_open_now,
    photoUrl: gym.photos[0]?.url ?? null,
    plans: gym.plans.map((plan) => ({
      name: plan.name,
      durationDays: plan.duration_days,
      visitsLimit: plan.visits_limit,
      price: Number(plan.price),
      audiences: plan.audiences.map((audience) => audience.name),
    })),
  };
}

function toCard(card: MembershipCardDto): MembershipCard {
  return {
    id: card.id,
    gymSlug: card.gym_slug,
    gymName: card.gym_name,
    name: card.name,
    price: Number(card.price),
    startsOn: card.starts_on,
    endsOn: card.ends_on,
    status: card.status,
    daysLeft: card.days_left,
    visitsLimit: card.visits_limit,
    visitsUsed: card.visits_used,
    visitsLeft: card.visits_left,
    visitedToday: card.visited_today,
  };
}

function toAccount(account: AccountDto): Account {
  return {
    gym: account.gym && toGym(account.gym),
    memberships: account.memberships.map(toCard),
  };
}

export async function getAccount(): Promise<Account> {
  return toAccount(await request<AccountDto>("GET", "my"));
}

export async function chooseGym(slug: string): Promise<Account> {
  return toAccount(await request<AccountDto>("PUT", "my/gym", { gym: slug }));
}

export async function clearGym(): Promise<Account> {
  return toAccount(await request<AccountDto>("DELETE", "my/gym"));
}

export async function addMembership(membership: NewMembership): Promise<MembershipCard> {
  const body = {
    name: membership.name,
    price: membership.price,
    duration_days: membership.durationDays,
    visits_limit: membership.visitsLimit,
    starts_on: membership.startsOn,
  };
  const card = await request<MembershipCardDto>("POST", "my/memberships", body, MEMBERSHIP_FIELDS);
  return toCard(card);
}

export async function deleteMembership(id: number): Promise<void> {
  await request("DELETE", `my/memberships/${id}`);
}

export async function markVisitToday(id: number): Promise<MembershipCard> {
  return toCard(await request<MembershipCardDto>("POST", `my/memberships/${id}/visits/today`));
}

export async function cancelVisitToday(id: number): Promise<MembershipCard> {
  return toCard(await request<MembershipCardDto>("DELETE", `my/memberships/${id}/visits/today`));
}

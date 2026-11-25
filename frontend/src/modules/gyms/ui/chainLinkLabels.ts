import type { ChainLink } from "../model/mapLinks";

// Labels are presentation, so they live in ui, not the model. Short on purpose: the map popup
// and the gym page fit them on a phone next to another button.
export const CHAIN_LINK_LABELS: Record<ChainLink["kind"], string> = {
  website: "Сайт",
  instagram: "Instagram",
};

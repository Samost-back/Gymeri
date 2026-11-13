import { getFilterOptions } from "../api/gyms";
import { EMPTY_SEARCH } from "../model/search-params";
import { GymFilters } from "./GymFilters/GymFilters";

// On the home page filters only lead to /gyms, so nothing is selected and there is no sort.
export async function HomeFilters() {
  const options = await getFilterOptions();
  return <GymFilters options={options} params={EMPTY_SEARCH} />;
}

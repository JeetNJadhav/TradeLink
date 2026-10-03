import { useAsync } from "../../../../shared/hooks/useAsync";
import { getListings } from "../services/listingService";

// The signed-in distributor's listings. `reload` refreshes them after a change.
const useListings = () => {
  const { data, loading, error, reload } = useAsync(getListings);

  return { listings: data ?? [], loading, error, reload };
};

export default useListings;

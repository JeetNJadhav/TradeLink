import type { DistributorSummary } from "../types/distributor";

interface DistributorInfoProps {
  distributor: DistributorSummary;
}

const NOT_PROVIDED = "Not provided";

const DistributorInfo = ({ distributor }: DistributorInfoProps) => {
  const location = distributor.locations[0];

  return (
    <section className="distributor-info">
      <h2>Distributor</h2>

      <h3>{distributor.businessName}</h3>

      <p>
        <strong>Location:</strong> {location?.city ?? NOT_PROVIDED}
      </p>

      <p>
        <strong>Address:</strong> {location?.address ?? NOT_PROVIDED}
      </p>

      <p>
        <strong>Contact:</strong> {distributor.contactInfo ?? NOT_PROVIDED}
      </p>
    </section>
  );
};

export default DistributorInfo;

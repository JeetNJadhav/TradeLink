import useGeolocation from "../hooks/useGeolocation";
import { ACCOUNT_LIMITS, type AccountDetailsValues } from "../types/account";

interface AccountDetailsFieldsProps {
  values: AccountDetailsValues;
  // Distributors have a business name and contact info; retailers a shop name.
  isDistributor: boolean;
  disabled: boolean;
  onChange: (values: AccountDetailsValues) => void;
}

// Coordinates are kept to about 10 cm, which is plenty for a shop address.
const formatCoordinate = (value: number) => value.toFixed(6);

// The inputs shared by registration and the profile screen: who the person is,
// their shop or business, and where it is.
const AccountDetailsFields = ({
  values,
  isDistributor,
  disabled,
  onChange,
}: AccountDetailsFieldsProps) => {
  const geolocation = useGeolocation();

  const set = (field: keyof AccountDetailsValues) => (value: string) =>
    onChange({ ...values, [field]: value });

  const fillCurrentLocation = async () => {
    const coordinates = await geolocation.locate();
    if (!coordinates) return;

    onChange({
      ...values,
      latitude: formatCoordinate(coordinates.latitude),
      longitude: formatCoordinate(coordinates.longitude),
    });
  };

  return (
    <>
      <label>
        Your name
        <input
          value={values.name}
          onChange={(e) => set("name")(e.target.value)}
          autoComplete="name"
          minLength={ACCOUNT_LIMITS.name.min}
          maxLength={ACCOUNT_LIMITS.name.max}
          disabled={disabled}
          required
        />
      </label>

      <label>
        Phone
        <input
          value={values.phone}
          onChange={(e) => set("phone")(e.target.value)}
          type="tel"
          autoComplete="tel"
          pattern={ACCOUNT_LIMITS.phonePattern}
          title="10 to 15 digits, with an optional leading +"
          disabled={disabled}
          required
        />
      </label>

      <label>
        {isDistributor ? "Business name" : "Shop name"}
        <input
          value={values.organizationName}
          onChange={(e) => set("organizationName")(e.target.value)}
          autoComplete="organization"
          minLength={ACCOUNT_LIMITS.organizationName.min}
          maxLength={ACCOUNT_LIMITS.organizationName.max}
          disabled={disabled}
          required
        />
      </label>

      {isDistributor && (
        <label>
          Contact info for retailers (optional)
          <input
            value={values.contactInfo}
            onChange={(e) => set("contactInfo")(e.target.value)}
            maxLength={ACCOUNT_LIMITS.contactInfo.max}
            disabled={disabled}
          />
        </label>
      )}

      <label>
        Address
        <input
          value={values.address}
          onChange={(e) => set("address")(e.target.value)}
          autoComplete="street-address"
          minLength={ACCOUNT_LIMITS.address.min}
          maxLength={ACCOUNT_LIMITS.address.max}
          disabled={disabled}
          required
        />
      </label>

      <label>
        City
        <input
          value={values.city}
          onChange={(e) => set("city")(e.target.value)}
          autoComplete="address-level2"
          minLength={ACCOUNT_LIMITS.city.min}
          maxLength={ACCOUNT_LIMITS.city.max}
          disabled={disabled}
          required
        />
      </label>

      <div className="coordinate-fields">
        <label>
          Latitude
          <input
            value={values.latitude}
            onChange={(e) => set("latitude")(e.target.value)}
            type="number"
            step="any"
            min={-90}
            max={90}
            disabled={disabled}
            required
          />
        </label>

        <label>
          Longitude
          <input
            value={values.longitude}
            onChange={(e) => set("longitude")(e.target.value)}
            type="number"
            step="any"
            min={-180}
            max={180}
            disabled={disabled}
            required
          />
        </label>
      </div>

      <button
        className="secondary-button"
        type="button"
        disabled={disabled || geolocation.locating}
        onClick={() => void fillCurrentLocation()}
      >
        {geolocation.locating ? "Locating..." : "Use my current location"}
      </button>

      {geolocation.error && (
        <p className="auth-error" role="alert">
          {geolocation.error}
        </p>
      )}
    </>
  );
};

export default AccountDetailsFields;

// The details a retailer or distributor gives at registration and edits on
// the profile screen.

export interface AccountLocation {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface AccountDetails {
  name: string;
  phone: string;
  // The retailer's shop name or the distributor's business name.
  organizationName: string;
  // Distributors only.
  contactInfo?: string;
  location: AccountLocation;
}

// The same details as they sit in form inputs: everything is text.
export interface AccountDetailsValues {
  name: string;
  phone: string;
  organizationName: string;
  contactInfo: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
}

export const EMPTY_ACCOUNT_DETAILS: AccountDetailsValues = {
  name: "",
  phone: "",
  organizationName: "",
  contactInfo: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
};

// Same limits as the backend's validation (src/utils/validation.ts).
export const ACCOUNT_LIMITS = {
  name: { min: 2, max: 100 },
  phonePattern: "\\+?[0-9]{10,15}",
  password: { min: 8, max: 72 },
  organizationName: { min: 2, max: 120 },
  contactInfo: { max: 200 },
  address: { min: 5, max: 200 },
  city: { min: 2, max: 80 },
} as const;

export const toAccountDetails = (
  values: AccountDetailsValues,
  isDistributor: boolean,
): AccountDetails => ({
  name: values.name.trim(),
  phone: values.phone.trim(),
  organizationName: values.organizationName.trim(),
  ...(isDistributor && values.contactInfo.trim()
    ? { contactInfo: values.contactInfo.trim() }
    : {}),
  location: {
    address: values.address.trim(),
    city: values.city.trim(),
    latitude: Number(values.latitude),
    longitude: Number(values.longitude),
  },
});

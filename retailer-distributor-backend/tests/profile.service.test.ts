import { beforeEach, describe, expect, it } from "vitest";
import { ProfileConflictError } from "../src/modules/profile/profile.errors";
import type { ProfileRepository } from "../src/modules/profile/profile.repository";
import { ProfileService } from "../src/modules/profile/profile.service";
import type {
  Profile,
  UpdateProfileInput,
} from "../src/modules/profile/profile.types";

const location = {
  address: "Baner Road, Shop 4",
  city: "Pune",
  latitude: 18.559,
  longitude: 73.7868,
};

const createProfiles = (): Profile[] => [
  {
    id: "user-retailer",
    name: "Asha Retailer",
    email: "asha@example.com",
    phone: "9000000001",
    role: "RETAILER",
    organizationName: "Corner Shop",
    contactInfo: null,
    location,
  },
  {
    id: "user-distributor",
    name: "Ravi Distributor",
    email: "ravi@example.com",
    phone: "9000000002",
    role: "DISTRIBUTOR",
    organizationName: "Wholesale One",
    contactInfo: "+91-9000000002",
    location,
  },
];

// Like the real repository: a retailer has no contact info, and a phone
// number belongs to one user.
class InMemoryProfileRepository implements ProfileRepository {
  profiles = createProfiles();

  async findByUserId(userId: string) {
    return this.profiles.find((profile) => profile.id === userId) ?? null;
  }

  async update(userId: string, changes: UpdateProfileInput) {
    const profile = this.profiles.find((candidate) => candidate.id === userId);

    if (!profile) {
      return null;
    }

    const phoneTaken = this.profiles.some(
      (candidate) =>
        candidate.id !== userId && candidate.phone === changes.phone,
    );

    if (phoneTaken) {
      throw new ProfileConflictError();
    }

    Object.assign(profile, {
      name: changes.name,
      phone: changes.phone,
      organizationName: changes.organizationName,
      contactInfo:
        profile.role === "DISTRIBUTOR" ? (changes.contactInfo ?? null) : null,
      location: changes.location,
    });

    return profile;
  }
}

describe("ProfileService", () => {
  let repository: InMemoryProfileRepository;
  let service: ProfileService;

  const changes: UpdateProfileInput = {
    name: "Asha R",
    phone: "9000000009",
    organizationName: "Corner Shop & Co",
    contactInfo: "+91-9000000009",
    location: { ...location, address: "Kharadi, Shop 12" },
  };

  beforeEach(() => {
    repository = new InMemoryProfileRepository();
    service = new ProfileService(repository);
  });

  it("returns the user's own profile", async () => {
    expect(await service.getProfile("user-distributor")).toMatchObject({
      role: "DISTRIBUTOR",
      organizationName: "Wholesale One",
      contactInfo: "+91-9000000002",
      location,
    });
  });

  it("reports a user without a profile as missing", async () => {
    await expect(service.getProfile("user-admin")).rejects.toMatchObject({
      statusCode: 404,
      message: "Profile not found",
    });
    await expect(
      service.updateProfile("user-admin", changes),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("updates a distributor's details, contact info and location", async () => {
    const updated = await service.updateProfile("user-distributor", changes);

    expect(updated).toMatchObject({
      name: "Asha R",
      phone: "9000000009",
      organizationName: "Corner Shop & Co",
      contactInfo: "+91-9000000009",
      location: { address: "Kharadi, Shop 12", city: "Pune" },
    });
    // Email and role are not editable.
    expect(updated.email).toBe("ravi@example.com");
    expect(updated.role).toBe("DISTRIBUTOR");
  });

  it("keeps a retailer without contact info", async () => {
    const updated = await service.updateProfile("user-retailer", changes);

    expect(updated.contactInfo).toBeNull();
  });

  it("rejects a phone number that belongs to another user", async () => {
    await expect(
      service.updateProfile("user-retailer", {
        ...changes,
        phone: "9000000002",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Phone number is already registered",
    });
    expect(repository.profiles[0].name).toBe("Asha Retailer");
  });
});

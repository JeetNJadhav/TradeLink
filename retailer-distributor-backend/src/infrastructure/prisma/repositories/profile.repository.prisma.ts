import type { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { ProfileConflictError } from "../../../modules/profile/profile.errors";
import type { ProfileRepository } from "../../../modules/profile/profile.repository";
import type {
  Profile,
  UpdateProfileInput,
} from "../../../modules/profile/profile.types";
import { isUniqueViolation } from "../prisma.errors";
import type { PrismaDb } from "../prisma.client";

// An account edits one location: the first it was given.
const firstLocation = {
  orderBy: { createdAt: "asc" },
  take: 1,
} satisfies Prisma.LocationFindManyArgs;

const withProfile = {
  retailer: { include: { locations: firstLocation } },
  distributor: { include: { locations: firstLocation } },
} satisfies Prisma.UserInclude;

type UserWithProfile = Prisma.UserGetPayload<{ include: typeof withProfile }>;

const toProfile = (user: UserWithProfile): Profile | null => {
  const organization = user.retailer ?? user.distributor;

  if (!organization) {
    return null;
  }

  const location = organization.locations[0];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    organizationName: user.retailer?.shopName ?? user.distributor!.businessName,
    contactInfo: user.distributor?.contactInfo ?? null,
    location: location
      ? {
          address: location.address,
          city: location.city,
          latitude: location.latitude,
          longitude: location.longitude,
        }
      : null,
  };
};

const findUser = (db: PrismaDb, userId: string) =>
  db.user.findUnique({ where: { id: userId }, include: withProfile });

export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<Profile | null> {
    const user = await findUser(this.prisma, userId);

    return user && toProfile(user);
  }

  async update(
    userId: string,
    changes: UpdateProfileInput,
  ): Promise<Profile | null> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await findUser(tx, userId);
        const organization = user?.retailer ?? user?.distributor;

        if (!user || !organization) {
          return null;
        }

        await tx.user.update({
          where: { id: userId },
          data: { name: changes.name, phone: changes.phone },
        });

        if (user.retailer) {
          await tx.retailer.update({
            where: { id: user.retailer.id },
            data: { shopName: changes.organizationName },
          });
        } else {
          await tx.distributor.update({
            where: { id: organization.id },
            data: {
              businessName: changes.organizationName,
              contactInfo: changes.contactInfo ?? null,
            },
          });
        }

        const location = organization.locations[0];

        if (location) {
          await tx.location.update({
            where: { id: location.id },
            data: changes.location,
          });
        } else {
          await tx.location.create({
            data: {
              ...changes.location,
              ...(user.retailer
                ? { retailerId: organization.id }
                : { distributorId: organization.id }),
            },
          });
        }

        const updated = await findUser(tx, userId);

        return updated && toProfile(updated);
      });
    } catch (error) {
      // Email is not editable here, so the only unique value is the phone.
      if (isUniqueViolation(error)) {
        throw new ProfileConflictError();
      }

      throw error;
    }
  }
}

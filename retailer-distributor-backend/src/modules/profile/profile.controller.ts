import { Request, ResponseToolkit } from "@hapi/hapi";
import { ProfileService } from "./profile.service";
import type { UpdateProfileInput } from "./profile.types";
import { successResponse } from "../../utils/response";

export const createGetProfileHandler =
  (profileService: ProfileService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { userId } = request.auth.credentials;
    const profile = await profileService.getProfile(userId);

    return successResponse(h, { profile });
  };

export const createUpdateProfileHandler =
  (profileService: ProfileService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { userId } = request.auth.credentials;
    const profile = await profileService.updateProfile(
      userId,
      request.payload as UpdateProfileInput,
    );

    return successResponse(h, { profile });
  };

import { Request, ResponseToolkit } from "@hapi/hapi";
import { DistributorListingService } from "./distributorListing.service";
import type {
  AddListingInput,
  ListingChanges,
} from "./distributorProduct.types";
import { successResponse } from "../../utils/response";

type ListingParams = { distributorProductId: string };

export const listListingsHandler =
  (service: DistributorListingService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { userId } = request.auth.credentials;
    const distributorProducts = await service.listListings(userId);

    return successResponse(h, { distributorProducts });
  };

export const addListingHandler =
  (service: DistributorListingService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { userId } = request.auth.credentials;
    const distributorProduct = await service.addListing(
      userId,
      request.payload as AddListingInput,
    );

    return successResponse(h, { distributorProduct }, 201);
  };

export const updateListingHandler =
  (service: DistributorListingService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { distributorProductId } = request.params as ListingParams;
    const { userId } = request.auth.credentials;
    const distributorProduct = await service.updateListing(
      userId,
      distributorProductId,
      request.payload as ListingChanges,
    );

    return successResponse(h, { distributorProduct });
  };

export const removeListingHandler =
  (service: DistributorListingService) =>
  async (request: Request, h: ResponseToolkit) => {
    const { distributorProductId } = request.params as ListingParams;
    const { userId } = request.auth.credentials;
    await service.removeListing(userId, distributorProductId);

    return successResponse(h, { distributorProductId });
  };

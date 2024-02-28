import { z } from "zod";

// Strings of length 3-25 characters where the characters can be alphabets, numbers, underscores
export const CommunityNameRegex = RegExp("^[a-zA-Z0-9_]{3,25}$");

export const CommunityValidator = z.object({
  name: z.string().regex(CommunityNameRegex),
});

export type CreateCommunityPayload = z.infer<typeof CommunityValidator>;

export const CommunitySubscriptionValidator = z.object({
  communityId: z.string(),
});

export type SubscribeToCommunityPayload = z.infer<
  typeof CommunitySubscriptionValidator
>;
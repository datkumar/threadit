import { z } from "zod";

// Strings of length 3-25 where characters can be alphabets/numbers/underscores/dashes
export const CommunityNameRegex = RegExp("^[a-zA-Z0-9_-]+$");

export const CommunityValidator = z.object({
  name: z
    .string()
    .min(3, "Community name must be at least 3 characters long")
    .max(25, "Community name can be max 25 characters long")
    .regex(CommunityNameRegex, "Invalid chareacters present"),
});

export type CreateCommunityPayload = z.infer<typeof CommunityValidator>;

export const CommunitySubscriptionValidator = z.object({
  communityId: z.string(),
});

export type SubscribeToCommunityPayload = z.infer<
  typeof CommunitySubscriptionValidator
>;

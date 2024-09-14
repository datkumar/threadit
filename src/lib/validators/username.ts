import { z } from "zod";

// One or more characters which can be alphabets/numbers/underscores/dashes
export const UsernameRegex = RegExp("^[a-zA-Z0-9_-]+$");

export const UsernameValidator = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(25, "Username can be max 32 characters long")
    .regex(UsernameRegex),
});

export type UsernameRequest = z.infer<typeof UsernameValidator>;

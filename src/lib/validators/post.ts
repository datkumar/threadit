import { z } from "zod";

export const PostValidator = z.object({
  communityId: z.string(),
  title: z
    .string()
    .min(2, { message: "Title must be at least 3 characters long" })
    .max(120, { message: "Title can be upto 120 characters long" }),
  content: z.any(), // Accept whatever the <Editor/> component uses
});

export type PostCreationRequest = z.infer<typeof PostValidator>;

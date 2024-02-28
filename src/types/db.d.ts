import type { Comment, Community, Post, PostVote, User } from "@prisma/client";

// Post and additional details via Joins
export type ExtendedPost = Post & {
  community: Community;
  author: User;
  votes: PostVote[];
  comments: Comment[];
};

import { CACHE_AFTER_UPVOTES } from "@/constants";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import type { PostVote } from "@prisma/client";
import { z } from "zod";

function getVoteSum(votes: PostVote[]): number {
  return votes.reduce((sum, vote) => {
    switch (vote.type) {
      case "UP":
        return sum + 1;
      case "DOWN":
        return sum - 1;
      default:
        return sum;
    }
  }, 0);
}

export const PATCH = async (req: Request) => {
  try {
    const body = await req.json();

    const { postId, voteType } = PostVoteValidator.parse(body);

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        votes: true,
      },
    });
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    const incomingVoteType = voteType;
    const existingVote = await db.postVote.findFirst({
      where: {
        postId,
        userId: session.user.id,
      },
    });

    // NO PREVIOUS EXISTING VOTE:
    if (!existingVote) {
      // Register fresh new vote
      await db.postVote.create({
        data: {
          postId,
          userId: session.user.id,
          type: incomingVoteType,
        },
      });
      // Re-count the votes
      const voteSum = getVoteSum(post.votes);
      // Cache the highly upvoted posts
      if (voteSum >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          id: post.id,
          title: post.title,
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          currentVote: voteType,
          createdAt: post.createdAt,
        };
        await redis.hset(`post:${postId}`, cachePayload);
      }
      return new Response("OK", { status: 201 });
    }

    // PREVIOUS VOTE EXISTS:
    if (existingVote.type === incomingVoteType) {
      // When incoming and existing vote SAME, delete vote
      await db.postVote.delete({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
      });
    } else {
      // When incoming and existing vote DIFFERENT, change vote
      await db.postVote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: incomingVoteType,
        },
      });
    }

    // Re-count the votes
    const voteSum = getVoteSum(post.votes);

    // Cache the highly upvoted posts
    if (voteSum >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        id: post.id,
        title: post.title,
        authorUsername: post.author.username ?? "",
        content: JSON.stringify(post.content),
        currentVote: incomingVoteType,
        createdAt: post.createdAt,
      };
      await redis.hset(`post:${postId}`, cachePayload);
    }

    // Succesfully updated vote
    return new Response(postId, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }
    return new Response("Could update your vote", { status: 500 });
  }
};

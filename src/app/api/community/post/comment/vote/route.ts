import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentVoteValidator } from "@/lib/validators/vote";
import { z } from "zod";

export const PATCH = async (req: Request) => {
  try {
    const body = await req.json();
    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const incomingVoteType = voteType;
    const existingVote = await db.commentVote.findFirst({
      where: {
        commentId,
        userId: session.user.id,
      },
    });

    // NO PREVIOUS EXISTING VOTE:
    if (!existingVote) {
      // Register fresh new vote
      await db.commentVote.create({
        data: {
          commentId,
          userId: session.user.id,
          type: incomingVoteType,
        },
      });
      return new Response("OK", { status: 201 });
    }
    // PREVIOUS VOTE EXISTS:
    if (existingVote.type === incomingVoteType) {
      // When incoming and existing vote SAME, delete old vote entry
      await db.commentVote.delete({
        where: {
          userId_commentId: {
            commentId,
            userId: session.user.id,
          },
        },
      });
    } else {
      // When incoming and existing vote DIFFERENT, change vote value
      await db.commentVote.update({
        where: {
          userId_commentId: {
            commentId,
            userId: session.user.id,
          },
        },
        data: {
          type: incomingVoteType,
        },
      });
    }
    // Succesfully updated vote
    return new Response(commentId, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }
    return new Response("Could update your vote", { status: 500 });
  }
};

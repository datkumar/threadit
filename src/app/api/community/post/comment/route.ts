import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { postId, text, replyToId } = CommentValidator.parse(body);

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await db.comment.create({
      data: {
        postId,
        text,
        authorId: session.user.id,
        replyToId, // Comment ID for which new comment is reply (optional)
      },
    });
    return new Response("Comment added", { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }
    return new Response("Could not add your commment. Please try again later", {
      status: 500,
    });
  }
};

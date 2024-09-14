import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { communityId, title, content } = PostValidator.parse(body);

    const isSubscribed = await db.subscription.findFirst({
      where: {
        communityId,
        userId: session.user.id,
      },
    });
    if (!isSubscribed) {
      return new Response(
        "Please subscribe to the community to make your Post",
        { status: 400 } // Bad request
      );
    }

    await db.post.create({
      data: {
        communityId,
        title,
        content,
        authorId: session.user.id,
      },
    });
    // Success
    return new Response("Post published successfully", { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }
    return new Response("Could not make your Post. Please try again later", {
      status: 500,
    });
  }
};

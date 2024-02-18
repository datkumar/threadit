import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommunitySubscriptionValidator } from "@/lib/validators/community";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { communityId } = CommunitySubscriptionValidator.parse(body);

    const isSubscribed = await db.subscription.findFirst({
      where: {
        communityId,
        userId: session.user.id,
      },
    });

    if (!isSubscribed) {
      return new Response(
        "You are not subscribed to this community",
        { status: 400 } // Bad request
      );
    }

    // Check if the user is creator of that community
    const isCreator = await db.community.findFirst({
      where: {
        id: communityId,
        creatorId: session.user.id,
      },
    });
    if (isCreator) {
      return new Response(
        "You cannot unsubscribe from the community you created"
      );
    }

    // Remove that user's subscription to that community
    await db.subscription.delete({
      where: {
        // Search by the composite  primary key (userId,communityId)
        userId_communityId: {
          userId: session.user.id,
          communityId,
        },
      },
    });
    // Unsubscribe successful
    return new Response(communityId, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }
    return new Response("Could not unsubscribe from this community", {
      status: 500,
    });
  }
};

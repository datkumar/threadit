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

    if (isSubscribed) {
      return new Response(
        "You are already subscribed to this community",
        { status: 400 } // Bad request
      );
    }

    // Add a subscription of that user to that community
    await db.subscription.create({
      data: {
        communityId,
        userId: session.user.id,
      },
    });
    // New Subscription successful
    return new Response(communityId, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid request data", { status: 422 });
    }
    return new Response("Could not subscribe to Community", { status: 500 });
  }
};

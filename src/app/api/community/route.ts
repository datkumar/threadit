import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommunityValidator } from "@/lib/validators/community";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response(
        "Unauthorized",
        { status: 401 } // Unauthorized
      );
    }

    const body = await req.json();
    console.log(`body: ${body}`);

    // Zod throws error if schema not validated
    const { name } = CommunityValidator.parse(body);
    console.log(`name: ${name}`);

    const communityExists = await db.community.findFirst({
      where: { name },
    });

    if (communityExists) {
      return new Response(
        "Community already exists",
        { status: 409 } // Conflict
      );
    }

    const newCommunity = await db.community.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    });

    // User is by-default subscribed to the community created
    await db.subscription.create({
      data: {
        userId: session.user.id,
        communityId: newCommunity.id,
      },
    });

    // Successfully created Commmunity
    return new Response(
      newCommunity.name,
      { status: 201 } // Created
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(
        "Invalid community name",
        { status: 422 } // Unprocessable Content
      );
    }
    return new Response(
      "Could not create Community",
      { status: 500 } // Internal Server error
    );
  }
};

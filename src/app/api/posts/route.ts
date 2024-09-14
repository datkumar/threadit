import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const GET = async (req: Request) => {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let subscribedCommunityIds: string[] = [];
  if (session) {
    const subscribedCommunitites = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        community: true,
      },
    });
    subscribedCommunityIds = subscribedCommunitites.map(
      ({ community }) => community.id
    );
  }

  try {
    const { limit, page, communityName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        communityName: z.string().nullish().optional(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        communityName: url.searchParams.get("communityName"),
      });

    let whereClause = {};
    if (communityName) {
      whereClause = {
        community: { name: communityName },
      };
    } else if (session) {
      whereClause = {
        community: {
          id: {
            in: subscribedCommunityIds,
          },
        },
      };
    }

    const limitInt = parseInt(limit);
    const pageInt = parseInt(page);
    const posts = await db.post.findMany({
      where: whereClause,
      take: limitInt,
      skip: (pageInt - 1) * limitInt,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        community: true,
        votes: true,
        author: true,
        comments: true,
      },
    });

    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response("Invalid data format", { status: 422 });
    }
    return new Response("Could not fetch more posts", { status: 500 });
  }
};

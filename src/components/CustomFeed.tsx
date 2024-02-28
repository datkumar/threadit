import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/constants";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { FC } from "react";
import PostFeed from "./PostFeed";

interface CustomFeedProps {}

const CustomFeed: FC<CustomFeedProps> = async ({}) => {
  const fetchLimit = INFINITE_SCROLL_PAGINATION_RESULTS;

  const session = await getAuthSession();
  const followedCommunitites = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      community: true,
    },
  });

  const posts = await db.post.findMany({
    where: {
      community: {
        name: {
          in: followedCommunitites.map(({ community }) => community.id),
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: fetchLimit,
    include: {
      author: true,
      community: true,
      votes: true,
      comments: true,
    },
  });

  return <PostFeed initialPosts={posts} />;
};

export default CustomFeed;

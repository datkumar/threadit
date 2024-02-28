import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/constants";
import { db } from "@/lib/db";
import { FC } from "react";
import PostFeed from "./PostFeed";

const GeneralFeed: FC = async () => {
  const fetchLimit = INFINITE_SCROLL_PAGINATION_RESULTS;
  const posts = await db.post.findMany({
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

export default GeneralFeed;

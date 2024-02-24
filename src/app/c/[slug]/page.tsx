import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/constants";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { FC } from "react";

interface PageProps {
  params: {
    slug: string;
  };
}

const CommunityPage: FC<PageProps> = async ({ params }: PageProps) => {
  const session = await getAuthSession();

  const community = await db.community.findFirst({
    where: { name: params.slug },
    include: {
      posts: {
        include: {
          author: true,
          community: true,
          votes: true,
          comments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  });

  if (!community) return notFound();

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        c/{community.name}
      </h1>
      <MiniCreatePost session={session} />
      <PostFeed initialPosts={community.posts} communityName={community.name} />
    </>
  );
};

export default CommunityPage;

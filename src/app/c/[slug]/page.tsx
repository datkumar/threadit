import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/constants";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CommunityPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const community = await db.community.findFirst({
    where: { name: slug },
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
}

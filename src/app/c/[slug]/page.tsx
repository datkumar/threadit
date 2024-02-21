import { FC } from "react";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { notFound } from "next/navigation";
import MiniCreatePost from "@/components/MiniCreatePost";

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
    </>
  );
};

export default CommunityPage;

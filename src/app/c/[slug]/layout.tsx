import BackToFeed from "@/components/BackToFeed";
import { JoinLeaveToggle } from "@/components/JoinLeaveToggle";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC } from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}

const CommunityLayout: FC<LayoutProps> = async ({ children, params }) => {
  const { slug } = params;

  const session = await getAuthSession();

  const community = await db.community.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  if (!community) return notFound();

  let isSubscribed = false;
  if (session?.user) {
    const hasSubscription = await db.subscription.findFirst({
      where: {
        community: { name: slug },
        userId: session.user.id,
      },
    });
    isSubscribed = hasSubscription ? true : false;
  }

  const isCreator = community.creatorId === session?.user.id || false;

  const memberCount = await db.subscription.count({
    where: {
      community: { name: slug },
    },
  });

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-6">
      <BackToFeed />

      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <div className="flex flex-col col-span-2 space-y-6">{children}</div>

          {/* Info Sidebar */}
          <div className="hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
            <div className="px-6 py-4">
              <p className="font-semibold py-3">About c/{community.name}</p>
            </div>

            {/* Description List */}
            <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Created </dt>
                <dd className="text-gray-700">
                  <time dateTime={community.createdAt.toDateString()}>
                    {format(community.createdAt, "MMM d, yyyy")}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Members </dt>
                <dd className="text-gray-700">
                  <div className="text-gray-900">{memberCount}</div>
                </dd>
              </div>

              {isCreator ? (
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-gray-500">You created this community </dt>
                </div>
              ) : (
                <JoinLeaveToggle
                  communityId={community.id}
                  communityName={community.name}
                  isSubscribed={isSubscribed}
                />
              )}

              <Link
                href={`/c/${slug}/submit`}
                className={buttonVariants({
                  className: "w-full mb-6",
                })}
              >
                Create Post
              </Link>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLayout;

import CommentsSection from "@/components/CommentsSection";
import EditorOutput from "@/components/EditorOutput";
import PostVoteServer from "@/components/post-vote/PostVoteServer";
import { buttonVariants } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { formatTimeToNow } from "@/lib/utils";
import { CachedPost } from "@/types/redis";
import type { Post, PostVote, User } from "@prisma/client";
import { ReloadIcon, TriangleUpIcon } from "@radix-ui/react-icons";
import { notFound } from "next/navigation";
import { FC, Suspense } from "react";

interface CommunityPostPageProps {
  params: {
    postId: string;
  };
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store"; // To fetch fresh comments (not cached)

type PostType =
  | (Post & {
      votes: PostVote[];
      author: User;
    })
  | null;

const CommunityPostPage: FC<CommunityPostPageProps> = async ({
  params: { postId },
}) => {
  const cachedPost = (await redis.hgetall(`post:${postId}`)) as CachedPost;

  let post: PostType = null;

  // Not present in cache, so fetch from DB
  if (!cachedPost) {
    post = await db.post.findFirst({
      where: { id: postId },
      include: {
        author: true,
        votes: true,
      },
    });
  }

  // Post doesn't exist
  if (!post && !cachedPost) return notFound();

  return (
    <div className="bg-white px-2">
      <div className="h-full flex flex-row items-start justify-start">
        {/* Votes streamed-in */}
        <Suspense fallback={<PostVoteShell />}>
          <PostVoteServer
            postId={postId}
            getData={async () => {
              const fetchedPost = await db.post.findUnique({
                where: { id: postId },
                include: { votes: true },
              });
              return fetchedPost;
            }}
          />
        </Suspense>
        {/* Post content */}
        <div className="w-full flex-1 bg-white p-4 rounded-sm">
          <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
            Posted by u/{post?.author.username ?? cachedPost.authorUsername}{" "}
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
          </p>
          <h1 className="text-xl font-semibold py-2 leading-5 text-gray-900">
            {post?.title ?? cachedPost.title}
          </h1>
          <EditorOutput content={post?.content ?? cachedPost.content} />
          {/* Comments streamed-in */}
          <Suspense
            fallback={
              <ReloadIcon className="h-10 w-10 text-zinc-500 animate-spin" />
            }
          >
            <CommentsSection postId={postId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

// Mock it to look like 'PostVoteClient' (without any interactivity)
const PostVoteShell = () => {
  return (
    <div className="flex items-center flex-col w-20">
      {/* Upvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <TriangleUpIcon className="h-10 text-zinc-300" />
      </div>
      {/* Vote sum */}
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <ReloadIcon className="h-10 text-zinc-300 animate-spin " />
      </div>
      {/* Downvote */}
      <div className={buttonVariants({ variant: "ghost", className: "p-0" })}>
        <TriangleUpIcon className="h-10  text-zinc-300" />
      </div>
    </div>
  );
};

export default CommunityPostPage;

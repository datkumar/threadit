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

interface PageProps {
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

const page: FC<PageProps> = async ({ params: { postId } }) => {
  const cachedPost = (await redis.hgetall(`post:${postId}`)) as CachedPost;

  let post: PostType = null;

  // Not present in cache, so fetch from DB
  if (!cachedPost) {
    post = await db.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });
  }

  // Post doesn't exist
  if (!post && !cachedPost) return notFound();

  return (
    <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
      <Suspense fallback={<PostVoteShell />}>
        <PostVoteServer
          postId={postId}
          getData={async () => {
            return db.post.findUnique({
              where: {
                id: postId,
              },
              include: {
                votes: true,
              },
            });
          }}
        />
      </Suspense>

      <div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
        <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
          Posted by u/{post?.author.username ?? cachedPost.authorUsername}{" "}
          {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
        </p>
        <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
          {post?.title ?? cachedPost.title}
        </h1>

        <EditorOutput content={post?.content ?? cachedPost.content} />

        <Suspense
          fallback={
            <ReloadIcon className="h-10 w-10 text-zinc-500 animate-spin" />
          }
        >
          <CommentsSection postId={postId} />
        </Suspense>
      </div>
    </div>
  );
};

// Mock it to look like 'PostVoteClient' (without any interactivity)
const PostVoteShell = () => {
  return (
    <div className="flex items-center flex-col pr-3 w-20">
      {/* Upvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <TriangleUpIcon className="h-10 w-10 text-zinc-300" />
      </div>
      {/* Vote sum */}
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <ReloadIcon className="h-10 w-10 text-zinc-300 animate-spin " />
      </div>
      {/* Downvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <TriangleUpIcon className="h-10 w-10 text-zinc-300" />
      </div>
    </div>
  );
};

export default page;

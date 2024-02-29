import { formatTimeToNow } from "@/lib/utils";
import type { Post, PostVote, User } from "@prisma/client";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { FC, useRef } from "react";
import EditorOutput from "./EditorOutput";
import PostVoteClient from "./post-vote/PostVoteClient";

type PartialVote = Pick<PostVote, "type">;

// Like a smaller 'Exteneded' post but not reusing anywhere
interface PostProps {
  communityName: string;
  post: Post & {
    author: User;
    votes: PostVote[];
  };
  commentCount: number;
  voteSum: number;
  currentVote?: PartialVote;
}

const Post: FC<PostProps> = ({
  communityName,
  post,
  commentCount,
  voteSum,
  currentVote,
}) => {
  const pRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        <PostVoteClient
          postId={post.id}
          initialVoteSum={voteSum}
          initialVote={currentVote?.type}
        />

        <div className="w-0 flex-1 ">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            {communityName ? (
              <>
                {/* Using normal link as we want a hard refresh, but <Link/> doesn't do that */}
                <a
                  href={`/c/${communityName}`}
                  className="underline text-zinc-900 text-sm underline-offset-2"
                >
                  c/{communityName}
                </a>
                <span className="px-1">·</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{" "}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          {/* Go to that Post with hard refresh (to get latest comments) */}
          <a href={`/c/${communityName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 laeding-6 text-gray-900">
              {post.title}
            </h1>
          </a>
          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={pRef}
          >
            <EditorOutput content={post.content} />
            {pRef.current?.clientHeight === 160 ? (
              // Blur post content that is bigger than 160px through a gradient
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"></div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <a
          href={`/c/${communityName}/post/${post.id}`}
          className="w-fit flex items-center gap-2"
        >
          <ChatBubbleIcon className="h-4 w-4" /> {commentCount} comments
        </a>
      </div>
    </div>
  );
};

export default Post;

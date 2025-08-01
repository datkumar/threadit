import { formatTimeToNow } from "@/lib/utils";
import type { Post, PostVote, User } from "@prisma/client";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { FC, useRef } from "react";
import EditorOutput from "./EditorOutput";
import PostVoteClient from "./post-vote/PostVoteClient";
import { safeParseEditorContent } from "@/lib/validators/editor-output-content";

type PartialVote = Pick<PostVote, "type">;

// Like a smaller 'extended' post but not reusing it anywhere
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

const PostComponent: FC<PostProps> = ({
  communityName,
  post,
  commentCount,
  voteSum,
  currentVote,
}) => {
  const pRef = useRef<HTMLDivElement>(null);

  return (
    <article className="rounded-lg bg-white shadow hover:shadow-lg transition-shadow duration-200">
      <div className="px-2 py-4 flex justify-between">
        {/* Votes section */}
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
            <h1 className="text-2xl font-bold pt-4 pb-3 leading-6  text-gray-900">
              {post.title}
            </h1>
          </a>

          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={pRef}
          >
            <EditorOutput content={safeParseEditorContent(post.content)} />

            {pRef.current?.clientHeight === 160 ? (
              // Blur post content that is bigger than 160px through a gradient
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent "></div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Comments count footer  */}
      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6 rounded-b-lg">
        <a
          href={`/c/${communityName}/post/${post.id}`}
          className="w-fit flex items-center gap-2"
        >
          <ChatBubbleIcon className="h-4 w-4" /> {commentCount} comments
        </a>
      </div>
    </article>
  );
};

export default PostComponent;

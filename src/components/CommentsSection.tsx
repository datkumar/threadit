import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVoteSum } from "@/lib/utils";
import { FC } from "react";
import CreateComment from "./CreateComment";
import PostComment from "./PostComment";

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection: FC<CommentsSectionProps> = async ({ postId }) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null, // Top-level comment (not reply to another comment)
    },
    include: {
      author: true,
      votes: true,
      replies: {
        // Load only one more level of replies to above comments
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4 ">
      <hr className="w-full h-px my-6" />

      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLvlComment) => {
            const topLvlCommentVoteSum = getVoteSum(topLvlComment.votes);
            const userVoteOnTopComment = topLvlComment.votes.find(
              (vote) => vote.userId === session?.user.id
            );
            return (
              <div key={topLvlComment.id} className="flex flex-col">
                {/* Top-level comment */}
                <div className="mb-2">
                  <PostComment
                    postId={postId}
                    comment={topLvlComment}
                    voteSum={topLvlCommentVoteSum}
                    currentVote={userVoteOnTopComment}
                  />
                </div>
                {/* Replies to only that top-level comment */}
                {topLvlComment.replies
                  // Sort replies descending by most-voted-on (not exactly highest vote-sum)
                  .sort((r1, r2) => r2.votes.length - r1.votes.length)
                  .map((reply) => {
                    const replyVoteSum = getVoteSum(reply.votes);
                    const userVoteOnReply = reply.votes.find(
                      (vote) => vote.userId === session?.user.id
                    );
                    return (
                      <div
                        key={reply.id}
                        className="ml-2 py-2 pl-4 border-l-2 border-zinc-200"
                      >
                        <PostComment
                          postId={postId}
                          comment={reply}
                          voteSum={replyVoteSum}
                          currentVote={userVoteOnReply}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentsSection;

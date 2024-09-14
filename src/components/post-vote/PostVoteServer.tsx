import { getAuthSession } from "@/lib/auth";
import { getVoteSum } from "@/lib/utils";
import type { Post, PostVote, VoteType } from "@prisma/client";
import { notFound } from "next/navigation";
import { FC } from "react";
import PostVoteClient from "./PostVoteClient";

// Either pass (initialVoteSum, initialVoteType) OR pass 'getData' function
interface PostVoteServerProps {
  postId: string;
  initialVoteSum?: number;
  initalVote?: VoteType | null;
  // Callback function to fetch Post
  getData?: () => Promise<
    | (Post & {
        votes: PostVote[];
      })
    | null
  >;
}

const PostVoteServer: FC<PostVoteServerProps> = async ({
  postId,
  initialVoteSum,
  initalVote,
  getData,
}) => {
  const session = await getAuthSession();

  let _voteSum = 0;
  let _currentVote: VoteType | undefined | null = undefined;

  if (!getData) {
    _voteSum = initialVoteSum!;
    _currentVote = initalVote!;
  } else {
    const post = await getData();
    if (!post) return notFound();

    _voteSum = getVoteSum(post.votes);
    _currentVote = post.votes.find(
      (vote) => vote.userId === session?.user.id
    )?.type;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVoteSum={_voteSum}
      initialVote={_currentVote}
    />
  );
};

export default PostVoteServer;

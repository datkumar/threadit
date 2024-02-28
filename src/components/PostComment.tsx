"use client";

import { errorToast, useCustomToast } from "@/hooks/use-custom-toast";
import { formatTimeToNow } from "@/lib/utils";
import { CommentRequest } from "@/lib/validators/comment";
import type { Comment, CommentVote, User } from "@prisma/client";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FC, useRef, useState } from "react";
import CommentVotes from "./CommentVotes";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/Button";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  postId: string;
  comment: ExtendedComment;
  voteSum: number;
  currentVote: CommentVote | undefined;
}

const PostComment: FC<PostCommentProps> = ({
  postId,
  comment,
  voteSum,
  currentVote,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { loginToast } = useCustomToast();
  const [isReplying, setIsReplying] = useState(false);
  const [replyInput, setReplyInput] = useState("");

  const commentRef = useRef<HTMLDivElement>(null);

  const { mutate: addReply, isPending } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, text, replyToId };
      const { data } = await axios.post("/api/community/post/comment", payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 401) {
        return loginToast();
      }
      return errorToast(
        "Could not add your comment",
        "Something went wrong. Please try again"
      );
    },
    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
      setReplyInput("");
    },
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name ?? null,
            image: comment.author.image ?? null,
          }}
          className="h-6 w-6"
        />
        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes
          commentId={comment.id}
          initialVoteSum={voteSum}
          initialVote={currentVote}
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-600"
          onClick={() => {
            if (!session) {
              router.push("/sign-in");
            }
            setIsReplying(true);
          }}
        >
          <ChatBubbleIcon className="h-5 w-5 mr-1.5" />
          Reply
        </Button>

        {isReplying && (
          <div className="grid w-full gap-1.5">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="user-comment">Your reply</Label>
              <div className="mt-2 ">
                <Textarea
                  id="user-comment"
                  rows={1}
                  placeholder="What are your thoughts on this?"
                  value={replyInput}
                  onChange={(event) => setReplyInput(event.target.value)}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsReplying(false)}
                    tabIndex={-1} // First focus goes to Submit button
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={replyInput.length === 0}
                    isLoading={isPending}
                    onClick={() => {
                      if (!replyInput) return;
                      addReply({
                        postId,
                        text: replyInput,
                        replyToId: comment.replyToId ?? comment.id,
                      });
                    }}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostComment;

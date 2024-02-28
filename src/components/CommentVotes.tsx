"use client";

import { errorToast, useCustomToast } from "@/hooks/use-custom-toast";
import { cn } from "@/lib/utils";
import { CommentVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import type { CommentVote, VoteType } from "@prisma/client";
import { TriangleDownIcon, TriangleUpIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { FC, useState } from "react";
import { Button } from "./ui/Button";

interface CommentVoteClientProps {
  commentId: string;
  initialVoteSum: number;
  initialVote?: Pick<CommentVote, "type">;
}

const CommentVoteClient: FC<CommentVoteClientProps> = ({
  commentId,
  initialVoteSum: initialVoteSum,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [voteSum, setVoteSum] = useState<number>(initialVoteSum);
  const [currVote, setCurrVote] = useState(initialVote);
  const prevVote = usePrevious(currVote);

  const { mutate: giveVote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };
      // Updating existing resource (not creating new one) so PATCH request
      await axios.patch("/api/community/post/comment/vote", payload);
    },
    // Optimistic updates (reflects instant change on UI assuming mutation succeeded)
    onMutate: (incomingVoteType: VoteType) => {
      if (currVote?.type === incomingVoteType) {
        setCurrVote(undefined);
        if (incomingVoteType === "UP") setVoteSum((prev) => prev - 1);
        else if (incomingVoteType === "DOWN") setVoteSum((prev) => prev + 1);
      } else {
        setCurrVote({ type: incomingVoteType });
        if (incomingVoteType === "UP") {
          setVoteSum((prev) => prev + (currVote ? 2 : 1));
        } else if (incomingVoteType === "DOWN") {
          setVoteSum((prev) => prev - (currVote ? 2 : 1));
        }
      }
    },
    onError: (err, voteType) => {
      // Error occured while giving upvote/downvote, so revert UI as before
      setCurrVote(prevVote);
      voteType === "UP"
        ? setVoteSum((prev) => prev - 1)
        : setVoteSum((prev) => prev + 1);

      if (err instanceof AxiosError && err.response?.status === 401) {
        return loginToast();
      }
      return errorToast("Error", "Could not register your vote");
    },
  });

  return (
    <div className="flex gap-1">
      <Button
        aria-label="upvote"
        onClick={() => giveVote("UP")}
        variant="ghost"
        size="icon"
        className="pt-1"
      >
        <TriangleUpIcon
          className={cn("h-8 w-8 text-zinc-300 ", {
            "text-orange-600 fill-orange-600": currVote?.type === "UP",
          })}
        />
      </Button>
      <p className="text-center px-1 py-2 font-medium text-sm text-zinc-900">
        {voteSum}
      </p>
      <Button
        aria-label="downvote"
        onClick={() => giveVote("DOWN")}
        variant="ghost"
        size="icon"
        className="pb-1"
      >
        <TriangleDownIcon
          className={cn("h-8 w-8 text-zinc-300", {
            "text-violet-500 fill-violet-500": currVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVoteClient;

"use client";

import { errorToast, useCustomToast } from "@/hooks/use-custom-toast";
import { cn } from "@/lib/utils";
import { PostVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import type { VoteType } from "@prisma/client";
import { TriangleDownIcon, TriangleUpIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";

interface PostVoteClientProps {
  postId: string;
  initialVoteSum: number;
  initialVote?: VoteType | null;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
  postId,
  initialVoteSum: initialVoteSum,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [voteSum, setVoteSum] = useState<number>(initialVoteSum);
  const [currVote, setCurrVote] = useState(initialVote);
  const prevVote = usePrevious(currVote);

  // Sync initial vote between the client and the server
  useEffect(() => setCurrVote(initialVote), [initialVote]);

  const { mutate: giveVote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      };
      // Updating existing resource (not creating new one) so PATCH request
      await axios.patch("/api/community/post/vote", payload);
    },
    // Optimistic updates (reflects instant change on UI assuming mutation succeeded)
    onMutate: (incomingVoteType: VoteType) => {
      if (currVote === incomingVoteType) {
        setCurrVote(undefined);
        if (incomingVoteType === "UP") setVoteSum((prev) => prev - 1);
        else if (incomingVoteType === "DOWN") setVoteSum((prev) => prev + 1);
      } else {
        setCurrVote(incomingVoteType);
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
    <div className="flex flex-col my-2">
      <Button
        size="sm"
        variant="ghost"
        aria-label="upvote"
        onClick={() => giveVote("UP")}
        className="px-1 py-2"
      >
        <TriangleUpIcon
          className={cn("h-16 w-10 text-zinc-300", {
            "text-orange-600 fill-orange-600": currVote === "UP",
          })}
        />
      </Button>
      <p className="text-center font-medium text-sm text-zinc-900">{voteSum}</p>
      <Button
        aria-label="downvote"
        onClick={() => giveVote("DOWN")}
        variant="ghost"
        size="sm"
        className="px-1 py-2"
      >
        <TriangleDownIcon
          className={cn("h-16 w-10 text-zinc-300", {
            "text-violet-500 fill-violet-500": currVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;

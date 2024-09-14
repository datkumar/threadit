"use client";

import { errorToast, useCustomToast } from "@/hooks/use-custom-toast";
import { CommentRequest } from "@/lib/validators/comment";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { Button } from "./ui/Button";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
  const router = useRouter();
  const [commentInput, setCommentInput] = useState<string>("");
  const { loginToast } = useCustomToast();

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, text, replyToId };
      const { data } = await axios.post("/api/community/post/comment", payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 401) {
        return loginToast();
      }
      return errorToast("Oops", "Something went wrong. Please try again");
    },
    onSuccess: () => {
      router.refresh();
      setCommentInput("");
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="user-comment">Your comment</Label>
      <div className="mt-2 ">
        <Textarea
          id="user-comment"
          rows={1}
          placeholder="What are your thoughts on this?"
          value={commentInput}
          onChange={(event) => setCommentInput(event.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button
            type="submit"
            disabled={commentInput.length === 0}
            isLoading={isPending}
            onClick={() =>
              addComment({ postId, text: commentInput, replyToId })
            }
          >
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;

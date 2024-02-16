"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  CommunityNameRegex,
  CreateCommunityPayload,
} from "@/lib/validators/community";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";

const showToast = (title: string, description: string) => {
  toast({
    variant: "destructive",
    title: title,
    description: description,
  });
};

const validCommunityName = (inputValue: string) => {
  return CommunityNameRegex.test(inputValue);
};

const Page = () => {
  const router = useRouter();
  const { loginToast } = useCustomToast();
  const [inputValue, setInputValue] = useState<string>("");
  const { mutate: handleCreateCommunity, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CreateCommunityPayload = {
        name: inputValue,
      };
      // Send request and parse data in received response
      const { data } = await axios.post("/api/community", payload);
      return data as string;
    },
    onSuccess: (data) => {
      router.push(`/c/${data}`);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        const statusCode = err.response?.status ?? 0;
        switch (statusCode) {
          //  Unauthorized
          case 401:
            return loginToast();
          // Conflict
          case 409:
            return showToast(
              "Community already exists",
              "Please choose another name for your community"
            );
          // Unprocessable Content
          case 422:
            return showToast(
              "Invalid community name",
              "Your community name should be of length 3-25 characters"
            );
          // Other
          default:
            return showToast(
              "Oops",
              "An error occured while creating your community"
            );
        }
      }
    },
  });

  return (
    <div className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Create a community</h1>
        </div>

        <hr className="bg-zinc-500 h-px" />

        <div>
          <p className="text-lg font-medium">
            What should we call your community?
          </p>
          <p className="text-xs pb-2 text-zinc-400">
            Community names must be of length 3-25 characters consisting of
            alphabets, numbers, underscores
          </p>
          <div className="relative">
            <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
              c/
            </p>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={router.back}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600"
            disabled={!validCommunityName(inputValue)}
            onClick={() => handleCreateCommunity()}
            isLoading={isPending}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;

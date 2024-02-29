"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  errorToast,
  successToast,
  useCustomToast,
} from "@/hooks/use-custom-toast";
import {
  CommunityNameRegex,
  CreateCommunityPayload,
} from "@/lib/validators/community";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const validCommunityName = (inputValue: string) => {
  return CommunityNameRegex.test(inputValue);
};

const CreateCommunityPage = () => {
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
      successToast("Congrats!!", "Your community has been created");
      router.push(`/c/${data}`);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        const statusCode = err.response?.status ?? 0;
        switch (statusCode) {
          case 401: // Unauthorized
            return loginToast();
          case 409: // Conflict
            return errorToast(
              "Community already exists",
              "Please choose another name for your community"
            );
          case 422: // Unprocessable Content
            return errorToast(
              "Invalid community name",
              "Your community name should be of length 3-25 characters"
            );
          default: // Other
            return errorToast(
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
            Community names can be 3-25 characters long comprising alphabets,
            numbers, underscores(_) and hyphens(-)
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

export default CreateCommunityPage;

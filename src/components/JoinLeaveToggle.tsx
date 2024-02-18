"use client";

import { FC, startTransition } from "react";
import { SubscribeToCommunityPayload } from "@/lib/validators/community";
import axios, { AxiosError } from "axios";
import { errorToast, useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/Button";
import { toast } from "@/hooks/use-toast";

interface JoinLeaveToggleProps {
  communityId: string;
  communityName: string;
  isSubscribed: boolean;
}

export const JoinLeaveToggle: FC<JoinLeaveToggleProps> = ({
  communityId,
  communityName,
  isSubscribed,
}) => {
  const router = useRouter();
  const { loginToast } = useCustomToast();

  const { mutate: subscribe, isPending: isSubscribing } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToCommunityPayload = {
        communityId,
      };
      const { data } = await axios.post("/api/community/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        const statusCode = err.response?.status ?? 0;
        switch (statusCode) {
          // Unauthorized
          case 401:
            return loginToast();
          default:
            return errorToast("Oops", "Something went wrong. Please try again");
        }
      }
    },
    onSuccess: () => {
      // Refresh the page, but without losing any state
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Subscription successful",
        description: `You are now a member of c/${communityName}`,
      });
    },
  });

  const { mutate: unsubscribe, isPending: isUnsubscribing } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToCommunityPayload = {
        communityId,
      };
      const { data } = await axios.post("/api/community/unsubscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        const statusCode = err.response?.status ?? 0;
        switch (statusCode) {
          // Unauthorized
          case 401:
            return loginToast();
          default:
            return errorToast("Oops", "Something went wrong. Please try again");
        }
      }
    },
    onSuccess: () => {
      // Refresh the page, but without losing any state
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Unsubscribed",
        description: `You are no longer a member of c/${communityName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      onClick={() => unsubscribe()}
      isLoading={isUnsubscribing}
      variant="destructive"
      className="w-full mt-2 mb-3"
    >
      Leave community
    </Button>
  ) : (
    <Button
      onClick={() => subscribe()}
      isLoading={isSubscribing}
      className="w-full mt-2 mb-3"
    >
      Join community
    </Button>
  );
};

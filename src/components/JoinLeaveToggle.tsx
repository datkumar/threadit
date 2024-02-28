"use client";

import { errorToast, useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { SubscribeToCommunityPayload } from "@/lib/validators/community";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FC, startTransition } from "react";
import { Button } from "./ui/Button";

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

  // SUBSCRIBE
  const { mutate: subscribe, isPending: isSubscribing } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToCommunityPayload = {
        communityId,
      };
      const { data } = await axios.post("/api/community/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 401) {
        return loginToast();
      }
      return errorToast(
        "Could not subscribe",
        "Something went wrong. Please try again"
      );
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

  // UNSUBSCRIBE
  const { mutate: unsubscribe, isPending: isUnsubscribing } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToCommunityPayload = {
        communityId,
      };
      const { data } = await axios.post("/api/community/unsubscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 401) {
        return loginToast();
      }
      return errorToast(
        "Could not unsubscribe",
        "Something went wrong. Please try again"
      );
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

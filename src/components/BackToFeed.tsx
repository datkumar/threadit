"use client";

import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { buttonVariants } from "./ui/Button";

interface ToFeedProps {}

const BackToFeed: FC<ToFeedProps> = ({}) => {
  const pathname = usePathname();
  // Path can be like "/c/react" OR "/c/react/post/postId"
  const communityPath = getCommunityPath(pathname);

  return (
    <a href={communityPath} className={buttonVariants({ variant: "ghost" })}>
      <ChevronLeftIcon className="h-4 w-4 mr-1" />
      {communityPath === "/" ? "Home" : "Visit Community"}
    </a>
  );
};

const getCommunityPath = (path: string) => {
  const splitPath = path.split("/");
  if (splitPath.length === 3) {
    // Turn "/c/react" into "/"
    return "/";
  } else if (splitPath.length > 3) {
    // Turn "/c/react/post/postId..." into "/c/react"
    return `/${splitPath[1]}/${splitPath[2]}`;
  }
  // default path, in case pathname does not match expected format
  return "/";
};

export default BackToFeed;

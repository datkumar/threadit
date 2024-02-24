"use client";

import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/constants";
import { ExtendedPost } from "@/types/db";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { FC, useEffect, useRef } from "react";
import Post from "./Post";

// Note: Could also use 'useIntersectionObserver' instead of 'useIntersection'

const pageFetchLimit = INFINITE_SCROLL_PAGINATION_RESULTS;

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  communityName?: string;
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, communityName }) => {
  // To track last post in feed at end of  the viewport
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry: lastPostEntry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });
  // Fetch user session client-side from the server
  const { data: session } = useSession();

  const fetchPage = async ({ pageParam = 1 }) => {
    const url = "/api/posts";
    const params = new URLSearchParams();
    params.append("limit", pageFetchLimit.toString());
    params.append("page", pageParam.toString());
    if (communityName) {
      params.append("communityName", communityName);
    }
    const query = `${url}?${params.toString()}`;

    const { data } = await axios.get(query.toString());
    // return data;
    return data as ExtendedPost[];
  };

  // More values: data.pages[], hasNextPage, similar values for prev. page
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["infinte-scroll-posts"],
    initialPageParam: 1,
    initialData: {
      pageParams: [1],
      pages: [initialPosts],
    },
    queryFn: fetchPage,
    // 1-based indexing, i.e. last element has page=length
    getNextPageParam: (lastPage, allPages) => allPages.length + 1,
  });

  // Fetch next page when the last post entry is intersecting with v iewport
  useEffect(() => {
    if (lastPostEntry?.isIntersecting) {
      fetchNextPage();
    }
  }, [lastPostEntry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;
  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, idx) => {
        // Net vote total after considering all upvotes and downvotes
        const voteSum = post.votes.reduce((sum, vote) => {
          if (vote.type === "UP") return sum + 1;
          if (vote.type === "DOWN") return sum - 1;
          return sum;
        }, 0);

        // User's vote on the post
        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        // Last post (which intersects with viewport), so attach ref to it
        if (idx === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                post={post}
                communityName={post.community.name}
                currentVote={currentVote}
                voteSum={voteSum}
                commentCount={post.comments.length}
              />
            </li>
          );
        }

        // Normal post not at the ends
        return (
          <Post
            key={post.id}
            post={post}
            communityName={post.community.name}
            currentVote={currentVote}
            voteSum={voteSum}
            commentCount={post.comments.length}
          />
        );
      })}
    </ul>
  );
};

export default PostFeed;

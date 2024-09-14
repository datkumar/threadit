import type { CommentVote, PostVote } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import locale from "date-fns/locale/en-IN";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatDistanceLocale = {
  lessThanXSeconds: "just now",
  xSeconds: "just now",
  halfAMinute: "just now",
  lessThanXMinutes: "{{count}} m",
  xMinutes: "{{count}} m",
  aboutXHours: "{{count}} hr",
  xHours: "{{count}} hr",
  xDays: "{{count}} d",
  aboutXWeeks: "{{count}} wk",
  xWeeks: "{{count}} wk",
  aboutXMonths: "{{count}} months",
  xMonths: "{{count}} months",
  aboutXYears: "{{count}} yr",
  xYears: "{{count}} yr",
  overXYears: "{{count}} yr",
  almostXYears: "{{count}} yr",
};

function formatDistance(token: string, count: number, options?: any): string {
  options = options || {};

  const result = formatDistanceLocale[
    token as keyof typeof formatDistanceLocale
  ].replace("{{count}}", count.toString());

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return "in " + result;
    } else {
      if (result === "just now") return result;
      return result + " ago";
    }
  }

  return result;
}

export function formatTimeToNow(date: Date): string {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  });
}

// Net vote total after considering all upvotes and downvotes
export function getVoteSum(votes: PostVote[] | CommentVote[]): number {
  return votes.reduce((sum, vote) => {
    switch (vote.type) {
      case "UP":
        return sum + 1;
      case "DOWN":
        return sum - 1;
      default:
        return sum;
    }
  }, 0);
}

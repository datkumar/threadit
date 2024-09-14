"use client";

import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import type { Community, Prisma } from "@prisma/client";
import { PersonIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash.debounce";
import { usePathname, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";

interface SeachBarProps {}

const SearchBar: FC<SeachBarProps> = ({}) => {
  const [searchText, setSearchText] = useState("");
  const commandRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: results,
    isFetching,
    isFetched,
    refetch,
  } = useQuery({
    queryKey: ["search-query"],
    enabled: false, // disable automatic refetching
    queryFn: async () => {
      if (!searchText) return [];

      const { data } = await axios.get(`/api/search?q=${searchText}`);

      return data as (Community & {
        _count: Prisma.CommentCountOutputType;
      })[];
    },
  });

  // Clicking outside or typing "Enter" would close the search results
  useOnClickOutside(commandRef, () => setSearchText(""));
  useEffect(() => setSearchText(""), [pathname]);

  // The search query is fired only 300ms after you stop typing
  const request = debounce(async () => {
    await refetch();
  }, 300);
  const debouncedFetch = useCallback(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Command
      ref={commandRef}
      className="relative rounded-lg border max-w-lg z-50 overflow-visible"
    >
      <CommandInput
        isLoading={isFetching}
        value={searchText}
        onValueChange={(newVal) => {
          setSearchText(newVal);
          debouncedFetch();
        }}
        placeholder="Search communities..."
        className=" outline-none border-none focus:border-none focus:outline-none ring-0"
      />
      {searchText.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}

          {(results?.length ?? 0) > 0 && (
            <CommandGroup heading="Communities">
              {results?.map((community) => (
                <CommandItem
                  key={community.id}
                  value={community.name}
                  className="cursor-pointer"
                  onSelect={() => {
                    router.push(`/c/${community.name}`);
                    router.refresh(); // To show latest posts
                  }}
                >
                  <PersonIcon className="mr-2 h-4 w-4" />
                  <a href={`/c/${community.name}`}>c/{community.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;

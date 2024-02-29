"use client";

import { ImageIcon, Link1Icon } from "@radix-ui/react-icons";
import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { FC } from "react";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface MiniCreatePostProps {
  session: Session | null;
}

const MiniCreatePost: FC<MiniCreatePostProps> = ({ session }) => {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <div className="overflow-hidden rounded-md bg-white shadow">
      <div className="h-full px-6 py-4 flex justify-between gap-1">
        <div className="relative h-5 w-5 top-2 mr-2">
          <UserAvatar
            user={{
              name: session?.user.name || null,
              image: session?.user.image || null,
            }}
          />
          <span className="absolute bottom-0 right-0 rounded-full w-2 h-2 bg-green-500 outline outline-1 outline-white" />
        </div>

        <Input
          readOnly
          placeholder="Create Post"
          onClick={() => router.push(`${pathName}/submit`)}
        />

        <Button
          variant="ghost"
          onClick={() => router.push(`${pathName}/submit`)}
          className="p-2 ml-2"
        >
          <ImageIcon className="w-5 h-5 text-zinc-600" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push(`${pathName}/submit`)}
          className="p-2"
        >
          <Link1Icon className="w-5 h-5 text-zinc-600" />
        </Button>
      </div>
    </div>
  );
};

export default MiniCreatePost;

import { User } from "next-auth";
import { FC } from "react";
import { Avatar, AvatarFallback, AvatarProps } from "@radix-ui/react-avatar";
import Image from "next/image";

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, "name" | "image">;
}

// Avatar image dimension
const avatarSize = 20;

const UserAvatar: FC<UserAvatarProps> = ({ user, ...props }) => {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className="relative aspect-square   ">
          <Image
            className="rounded-full h-5 w-5"
            src={user.image}
            alt="Profile pic"
            height={avatarSize}
            width={avatarSize}
            // style={{ objectFit: "fill" }}
            // fill={true}
            // referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name}</span>
          <Image
            src="/default-avatar.svg"
            alt="default user pic"
            height={avatarSize}
            width={avatarSize}
            className="h-4 w-4"
          />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;

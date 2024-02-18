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
        <div className="relative aspect-square h-full w-full">
          <Image
            className="rounded-full "
            src={user.image}
            alt="Profile pic"
            height={avatarSize}
            width={avatarSize}
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
            className="h-5 w-5"
          />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;

"use client";

import { FC } from "react";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";

const CloseModal: FC = () => {
  // Note: using router from 'next/navigation' NOT 'next/router'
  const router = useRouter();

  return (
    <Button
      variant={"ghost"}
      onClick={router.back}
      aria-label="Close modal"
      className="h-7 w-7 p-2 rounded-full"
    >
      <Cross1Icon strokeWidth={50} />
    </Button>
  );
};

export default CloseModal;

import { SignIn } from "@/components/SignIn";
import { SignUp } from "@/components/SignUp";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";

const page = () => {
  return (
    <div className="absolute inset-0">
      <div className="h-full max-w-2xl max-auto flex flex-col items-center justify-center gap-20">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "self-start -mt-20"
          )}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Home
        </Link>
        <SignUp />
      </div>
    </div>
  );
};

export default page;

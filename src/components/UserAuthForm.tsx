"use client";

import { FC, useState } from "react";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";
import IconImage from "./ui/IconImage";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";

interface UserAuthFormProps extends React.HtmlHTMLAttributes<HTMLDivElement> {}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // setTimeout(() => setIsLoading(false), 5000);
    try {
      await signIn("google");
    } catch (error) {
      // show Toast notification
      toast({
        variant: "destructive",
        title: "There was a problem",
        description: "An error occured during Google sign-in",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex justify-center", className)} {...props}>
      <Button
        isLoading={isLoading}
        size="sm"
        className="w-full py-5"
        onClick={loginWithGoogle}
      >
        {!isLoading && (
          <IconImage
            src="/google-logo.svg"
            alt="Google Logo"
            className="h-4 2-4"
          />
        )}
        Google
      </Button>
    </div>
  );
};

export default UserAuthForm;

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "./use-toast";

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      variant: "destructive",
      title: "Login required",
      description: "You need to be logged-in for this action",
      action: (
        <Link href="/sign-in" onClick={() => dismiss()}>
          <Button variant="secondary" className="mr-2">
            Login
          </Button>
        </Link>
      ),
    });
  };

  return { loginToast };
};

export const errorToast = (title: string, description?: string) => {
  toast({
    variant: "destructive",
    title: title,
    description: description,
  });
};

export const successToast = (title: string, description?: string) => {
  toast({
    className: "bg-green-300",
    variant: "default",
    title: title,
    description: description,
  });
};

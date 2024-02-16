import Link from "next/link";
import { toast } from "./use-toast";
import { Button } from "@/components/ui/Button";

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

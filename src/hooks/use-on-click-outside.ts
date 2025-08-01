// Reference: https://hashnode.com/post/useonclickoutside-custom-hook-to-detect-the-mouse-click-on-outside-typescript-ckrejmy3h0k5r91s18iu42t28

import { RefObject, useEffect } from "react";

type Event = MouseEvent | TouchEvent;

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: Event) => void
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const target = event.target as Node;
      const el = ref.current;

      // Do nothing if clicking ref's element or its descendant elements
      if (!el || el.contains(target)) {
        return;
      }

      // if (!el || el.contains((event?.target as Node) || null)) {
      //   return;
      // }

      // Call the handler only if the click is outside of the element passed.
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // Reload only if ref or handler changes
};

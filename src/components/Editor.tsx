"use client";

import { errorToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { uploadFiles } from "@/lib/uploadthing";
import { PostCreationRequest, PostValidator } from "@/lib/validators/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextAreaAutoSize from "react-textarea-autosize";

import type EditorJS from "@editorjs/editorjs";

interface EditorProps {
  communityId: string;
}

const Editor: FC<EditorProps> = ({ communityId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostCreationRequest>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      communityId,
      title: "",
      content: null,
    },
  });

  const pathName = usePathname();
  const router = useRouter();

  const editorRef = useRef<EditorJS>();
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  // Define the title ref separately
  const { ref: titleRef, ...rest } = register("title");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const initEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const Code = (await import("@editorjs/code")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const List = (await import("@editorjs/list")).default;
    const Table = (await import("@editorjs/table")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    // When editor is not initialized
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editor", // ID for the editor 'div' element
        onReady() {
          editorRef.current = editor;
        },
        placeholder: "Type here to write your post...",
        inlineToolbar: true,
        data: { blocks: [] },
        // Plugins used
        tools: {
          header: Header,
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
          linkTool: {
            class: LinkTool,
            // Config for reading the metadata of the link
            config: {
              endpoint: "/api/link",
            },
          },
          // Each Image added is uploaded to UploadThing store
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  // Upload  to UploadThing
                  const [res] = await uploadFiles("imageUploader", {
                    files: [file],
                  });
                  console.log(res);
                  return {
                    success: 1,
                    file: {
                      url: res.url,
                    },
                  };
                },
              },
            },
          },
        },
      });
    }
  }, []);

  useEffect(() => {
    // It's undefined on server side, but changes after
    // the component initially mounts on client
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_key, _val] of Object.entries(errors)) {
        errorToast(
          "Something went wrong",
          (_val as { message: string }).message
        );
      }
    }
  }, [errors]);

  useEffect(() => {
    const init = async () => {
      await initEditor();
      // Set focus on the Title at the end of page load
      setTimeout(() => _titleRef.current?.focus(), 0);
    };

    if (isMounted) {
      init();
      // Cleanup: Un-initalize the Editor
      return () => {
        editorRef.current?.destroy();
        editorRef.current = undefined;
      };
    }
  }, [isMounted, initEditor]);

  const { mutate: createPost } = useMutation({
    mutationFn: async ({
      communityId,
      title,
      content,
    }: PostCreationRequest) => {
      const payload: PostCreationRequest = { communityId, title, content };
      const { data } = await axios.post("/api/community/post/create", payload);
      return data;
    },
    onSuccess: () => {
      // Redirect '/c/mycommunity/submit' to '/c/mycommunity' to show their new Post
      const redirectPath = pathName.split("/").slice(0, -1).join("/");
      router.push(redirectPath);
      router.refresh(); // Get new version of feed (not from cache)
      return toast({
        title: "Post successfully published",
      });
    },
    onError: () => {
      return errorToast(
        "Something went wrong",
        "Your post could not be published. Try again later"
      );
    },
  });

  const onSubmit = async (data: PostCreationRequest) => {
    const blocks = await editorRef.current?.save();

    const payload: PostCreationRequest = {
      communityId,
      title: data.title,
      content: blocks,
    };

    createPost(payload);
  };

  if (!isMounted) return null;

  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200 ">
      <form
        id="community-post-form"
        onSubmit={handleSubmit(onSubmit)}
        className="w-fit"
      >
        <div className="prose prose-stone dark:prose-invert">
          {/* Resizable Title area */}
          <TextAreaAutoSize
            ref={(elem) => {
              titleRef(elem);
              // @ts-ignore
              _titleRef.current = elem;
            }}
            {...rest}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />

          {/* Editor mounts here */}
          <div id="editor" className="min-h-[500px]"></div>
        </div>
      </form>
    </div>
  );
};

export default Editor;

// import {
//   generateUploadButton,
//   generateUploadDropzone,
// } from "@uploadthing/react";
// export const UploadButton = generateUploadButton<OurFileRouter>();
// export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react/hooks";

export const { uploadFiles } = generateReactHelpers<OurFileRouter>();

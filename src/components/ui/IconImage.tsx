import { FC } from "react";
import Image from "next/image";

interface IconImageProps extends React.HtmlHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const IconImage: FC<IconImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width ?? 50}
      height={height ?? 50}
    />
  );
};

export default IconImage;

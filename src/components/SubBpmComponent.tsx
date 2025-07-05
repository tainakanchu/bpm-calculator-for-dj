import React from "react";

type Props = {
  title: string;
  value: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const SubBpmComponent: React.FC<Props> = ({
  title,
  value,
  ...props
}) => {
  return (
    <div {...props}>
      <p className="text-xl">{title}</p>
      <p className="text-5xl font-bold">{value}</p>
    </div>
  );
};
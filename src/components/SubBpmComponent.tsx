import React from 'react';

type Props = {
  title: string;
  value: string;
};

export const SubBpmComponent: React.FC<Props> = ({ title, value }) => {
  return (
    <div>
      <p className="text-xl">{title}</p>
      <p className="text-5xl font-bold">{value}</p>
    </div>
  );
};

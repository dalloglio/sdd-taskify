import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function Button({ children, className = '', ...rest }: Props) {
  return (
    <button className={`btn-primary ${className}`} {...rest}>
      {children}
    </button>
  );
}

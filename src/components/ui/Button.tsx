import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "text";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({ variant = "filled", size = "md", className, children, ...props }: ButtonProps) {
  const btnClass = `${styles.btn} ${styles[variant]} ${styles[size]} ${className || ""}`;
  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
}

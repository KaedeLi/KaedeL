import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  active = false,
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm shadow-sm";
  
  const variants = {
    primary: "bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:shadow-lg hover:shadow-pink-200 border border-white/20",
    secondary: "bg-white/60 text-slate-700 hover:bg-white/80 border border-white/40",
    ghost: "bg-transparent text-slate-600 hover:bg-white/20",
  };

  const activeStyles = active ? "ring-2 ring-pink-400 ring-offset-2 ring-offset-purple-50 bg-white" : "";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${activeStyles} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};
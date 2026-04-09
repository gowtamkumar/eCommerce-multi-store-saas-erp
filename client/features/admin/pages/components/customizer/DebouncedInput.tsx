"use client";

import { useEffect, useState } from 'react';

type BaseProps = {
  value: string;
  onChange: (value: string) => void;
  debounceTime?: number;
  as?: 'input' | 'textarea';
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { as: 'textarea' };

type DebouncedInputProps = BaseProps & (Omit<InputProps, 'value' | 'onChange'> | Omit<TextareaProps, 'value' | 'onChange'>);

export default function DebouncedInput({ 
  value, 
  onChange, 
  debounceTime = 500, 
  as = 'input',
  ...props 
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceTime, value]);

  const Component = as as any;

  return (
    <Component
      {...props}
      value={localValue}
      onChange={(e: any) => setLocalValue(e.target.value)}
    />
  );
}

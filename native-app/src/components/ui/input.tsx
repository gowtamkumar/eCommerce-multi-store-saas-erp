import * as React from 'react';
import { TextInput, View, TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, label, error, containerClassName, ...props }, ref) => {
    return (
      <View className={cn('w-full flex-col gap-1.5', containerClassName)}>
        {label && (
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            'h-12 w-full rounded-xl border border-border bg-background px-4 text-foreground text-sm',
            'focus:border-primary focus:ring-1 focus:ring-primary',
            props.editable === false && 'opacity-50 bg-muted',
            error && 'border-destructive focus:border-destructive focus:ring-destructive',
            className
          )}
          placeholderTextColor="hsl(var(--muted-foreground))"
          {...props}
        />
        {error && (
          <Text className="text-xs text-destructive font-medium">
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input };

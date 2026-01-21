"use client";

import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import dynamic from 'next/dynamic';

interface IconProps extends LucideProps {
  name: string;
}

const LucideIcon = ({ name, ...props }: IconProps) => {
  // Convert name to kebab-case just in case it's stored differently
  const formattedName = name.toLowerCase().replace(/\s+/g, '-');

  // Validate if the icon exists in the dynamic imports
  if (!(formattedName in dynamicIconImports)) {
    // If not found, you can return a default icon or null
    return null;
  }

  const DynamicIcon = dynamic(dynamicIconImports[formattedName as keyof typeof dynamicIconImports], {
    loading: () => <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full w-full h-full" />,
    ssr: false // Icons usually don't need SSR if they are dynamic
  });

  return <DynamicIcon {...props} />;
};

export default LucideIcon;

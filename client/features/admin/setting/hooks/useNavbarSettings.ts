/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";

/**
 * Types for the navbar settings. These match the shape of the
 * `navbar` object in the AdminSettingsContext.
 */
export interface NavbarSettings {
  layout: string;
  template: string;
  backgroundColor: string;
  textColor: string;
  shadowIntensity: string;
  hoverEffect: string;
  borderRadius: string;
  sticky: boolean;
  maxWidth: string;
  bottomShape: string;
  backgroundPattern: string;
  transparent: boolean;
  showCurrency: boolean;
  links: unknown[];
}

/**
 * Hook that centralises all update logic for the navbar settings.
 * It receives the current form data and the setter from the
 * AdminSettingsContext and exposes helpers that can be used by
 * The UI components.
 */
export function useNavbarSettings(
  formData: unknown,
  setFormData: (data: unknown) => void,
): {
  updateNavbar: (updates: Partial<NavbarSettings>) => void;
  updateNavbarField: (key: keyof NavbarSettings, value: unknown) => void;
  updateNavbarLinks: (links: unknown[]) => void;
} {
  const updateNavbar = useCallback(
    (updates: Partial<NavbarSettings>) => {
      setFormData((prev: unknown) => ({
        ...prev,
        navbar: {
          ...((prev as any).navbar || {}),
          ...updates,
        },
      }));
    },
    [setFormData],
  );

  const updateNavbarField = useCallback(
    (key: keyof NavbarSettings, value: unknown) => {
      updateNavbar({ [key]: value } as Partial<NavbarSettings>);
    },
    [updateNavbar],
  );

  const updateNavbarLinks = useCallback(
    (links: unknown[]) => {
      updateNavbar({ links });
    },
    [updateNavbar],
  );

  return { updateNavbar, updateNavbarField, updateNavbarLinks };
}

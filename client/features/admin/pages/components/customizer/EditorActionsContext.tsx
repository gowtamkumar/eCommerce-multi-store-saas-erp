"use client";

import { createContext, useContext } from 'react';

export interface EditorActions {
  duplicate: (id: string) => void;
  remove: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  toggleHidden: (id: string) => void;
  toggleLocked: (id: string) => void;
  copy: (id: string) => void;
  paste: (afterId: string) => void;
  canPaste: boolean;
  canMoveUp: (id: string) => boolean;
  canMoveDown: (id: string) => boolean;
  openContextMenu: (id: string, e: React.MouseEvent) => void;
}

export const EditorActionsContext = createContext<EditorActions | null>(null);

export function useEditorActions(): EditorActions | null {
  return useContext(EditorActionsContext);
}

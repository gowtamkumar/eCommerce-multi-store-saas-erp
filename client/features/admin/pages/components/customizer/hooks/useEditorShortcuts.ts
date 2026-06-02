import { useEffect } from 'react';

/**
 * Centralized keyboard shortcut bindings for the page editor.
 *
 * Some shortcuts (save / undo / redo / slash / escape) always fire.
 * Selection-scoped shortcuts (delete / duplicate / copy / paste / move)
 * are skipped when the user is typing in an input — otherwise typing a
 * "d" or hitting backspace inside a label would clobber blocks.
 */
interface UseEditorShortcutsArgs {
  selectedId: string | null;
  showInserter: boolean;
  hasContextMenu: boolean;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenInserter: () => void;
  onCloseInserter: () => void;
  onCloseContextMenu: () => void;
  onClearSelection: () => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: (id: string) => void;
  onPaste: (id: string) => void;
  onMove: (id: string, delta: number) => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.isContentEditable ||
    el.getAttribute('role') === 'textbox'
  );
}

export function useEditorShortcuts({
  selectedId,
  showInserter,
  hasContextMenu,
  onSave,
  onUndo,
  onRedo,
  onOpenInserter,
  onCloseInserter,
  onCloseContextMenu,
  onClearSelection,
  onRemove,
  onDuplicate,
  onCopy,
  onPaste,
  onMove,
}: UseEditorShortcutsArgs): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const editable = isEditableTarget(e.target);
      const meta = e.metaKey || e.ctrlKey;

      // Save: always wins, even mid-typing.
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
        return;
      }
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
        return;
      }
      if (meta && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        onRedo();
        return;
      }
      // Slash command palette opens only when not typing.
      if (e.key === '/' && !editable && !showInserter) {
        e.preventDefault();
        onOpenInserter();
        return;
      }
      if (e.key === 'Escape') {
        if (showInserter) onCloseInserter();
        else if (hasContextMenu) onCloseContextMenu();
        else if (selectedId) onClearSelection();
        return;
      }
      // Block-targeted shortcuts require a selection and a non-text target.
      if (!selectedId || editable) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onRemove(selectedId);
      } else if (meta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicate(selectedId);
      } else if (meta && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        onCopy(selectedId);
      } else if (meta && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        onPaste(selectedId);
      } else if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        onMove(selectedId, -1);
      } else if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        onMove(selectedId, 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    selectedId,
    showInserter,
    hasContextMenu,
    onSave,
    onUndo,
    onRedo,
    onOpenInserter,
    onCloseInserter,
    onCloseContextMenu,
    onClearSelection,
    onRemove,
    onDuplicate,
    onCopy,
    onPaste,
    onMove,
  ]);
}

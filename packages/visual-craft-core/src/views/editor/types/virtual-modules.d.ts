declare module 'virtual:visual-craft-core-public-assets' {
  export const editorIcons: Record<string, string>;
  export const manageIcons: Record<string, string>;
  export function getEditorIcon(icon: string): string;
  export function getManageIcon(icon: string): string;
}


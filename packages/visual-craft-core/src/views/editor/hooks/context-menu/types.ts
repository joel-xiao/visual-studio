export interface ShortcutItem {
    icon?: string;
    label?: string;
}

export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: string;
    shortcut?: string;
    shortcuts?: ShortcutItem[];
    disabled?: boolean;
    divider?: boolean;
    children?: readonly ContextMenuItem[];
    checked?: boolean;
    level?: number;
    action?: () => void;
}

export interface ContextMenuState {
    show: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
}

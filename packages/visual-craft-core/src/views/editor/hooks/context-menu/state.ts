import { reactive, readonly } from 'vue';
import type { ContextMenuState, ContextMenuItem } from './types';

const _state = reactive<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
    items: []
});

export const useContextMenu = () => {
    const open = (x: number, y: number, items: ContextMenuItem[]) => {
        _state.x = x;
        _state.y = y;
        // Simple assignment to preserve function references and nested objects
        _state.items = items;
        _state.show = true;
    };

    const close = () => {
        _state.show = false;
    };

    return {
        open,
        close,
        state: _state // We keep it reactive for the component
    };
};

export const getContextMenuState = () => readonly(_state);

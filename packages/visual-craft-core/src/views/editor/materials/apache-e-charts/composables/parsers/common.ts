/**
 * 通用处理逻辑
 */
export function processStyles(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
        obj.forEach(processStyles);
        return;
    }
    if (obj.styles && Array.isArray(obj.styles)) {
        const styles = obj.styles;
        obj.fontWeight = styles.includes('bold') ? 'bold' : 'normal';
        obj.fontStyle = styles.includes('italic') ? 'italic' : 'normal';
        if (styles.includes('underline')) {
            obj.textDecoration = 'underline';
        } else if (styles.includes('line-through')) {
            obj.textDecoration = 'line-through';
        } else {
            obj.textDecoration = 'none';
        }
    }
    Object.values(obj).forEach(processStyles);
}

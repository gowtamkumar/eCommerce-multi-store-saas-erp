import type { Category } from '../type';

export type CategoryRow = Category & { depth: number; hasChildren: boolean };

export const buildTree = (items: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];
    items.forEach(item => map.set(item.id!, { ...item, children: [] }));
    map.forEach(item => {
        if (item.parentId && map.has(item.parentId)) {
            map.get(item.parentId)!.children!.push(item);
        } else {
            roots.push(item);
        }
    });
    return roots;
};

export const flattenTree = (nodes: Category[], collapsed: Set<string>, depth = 0): CategoryRow[] => {
    const flat: CategoryRow[] = [];
    nodes.forEach(node => {
        const hasChildren = !!node.children && node.children.length > 0;
        flat.push({ ...node, depth, hasChildren });
        if (hasChildren && !(node.id && collapsed.has(node.id))) {
            flat.push(...flattenTree(node.children!, collapsed, depth + 1));
        }
    });
    return flat;
};

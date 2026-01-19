import { shallowRef, triggerRef } from 'vue';

export interface AlignmentLine {
    type: 'vertical' | 'horizontal';
    start: number;
    end: number;
    pos: number;
}

export interface MeasurementLine {
    type: 'vertical' | 'horizontal';
    start: number;
    end: number;
    pos: number;
    value: number;
    // Independent extension ranges for start and end points
    startExtend?: { s: number; e: number };
    endExtend?: { s: number; e: number };
}

// Distance threshold for snapping (in pixels)
const SNAP_THRESHOLD = 5;

// Define the edges we care about
type Edge = 'start' | 'center' | 'end';

interface SnapResult {
    dx: number;
    dy: number;
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    rotate?: number;
    id?: string;
}

class AlignmentExtension {
    #rawLines: AlignmentLine[] = [];
    #rawMeasurements: MeasurementLine[] = [];

    #lines = shallowRef<AlignmentLine[]>([]);
    #measurements = shallowRef<MeasurementLine[]>([]);

    #linePool: AlignmentLine[] = [];
    #measPool: MeasurementLine[] = [];

    #parentToChildren = new Map<string, string[]>();
    #lastNodesCount = 0;

    private getPooledLine(): AlignmentLine {
        return this.#linePool.pop() || { type: 'vertical', start: 0, end: 0, pos: 0 };
    }

    private getPooledMeas(): MeasurementLine {
        return this.#measPool.pop() || { type: 'vertical', start: 0, end: 0, pos: 0, value: 0 };
    }

    public getLines() {
        return this.#lines;
    }

    public getMeasurements() {
        return this.#measurements;
    }

    public clearLines() {
        for (let i = 0; i < this.#rawLines.length; i++) this.#linePool.push(this.#rawLines[i]);
        for (let i = 0; i < this.#rawMeasurements.length; i++) this.#measPool.push(this.#rawMeasurements[i]);

        this.#rawLines.length = 0;
        this.#rawMeasurements.length = 0;

        this.#lastNodesCount = 0;

        this.syncToReactive();
    }

    private syncToReactive() {
        this.#lines.value = [...this.#rawLines];
        this.#measurements.value = [...this.#rawMeasurements];
    }

    public calculateSnappingWithNodes(
        movingNodes: INode[],
        allNodes: INode[],
        delta: { dx: number; dy: number }
    ): SnapResult {
        const moveIds = new Set<string>();

        if (this.#lastNodesCount !== allNodes.length) {
            this.#parentToChildren.clear();
            for (let i = 0; i < allNodes.length; i++) {
                const n = allNodes[i];
                if (n.parentId) {
                    let children = this.#parentToChildren.get(n.parentId);
                    if (!children) {
                        children = [];
                        this.#parentToChildren.set(n.parentId, children);
                    }
                    children.push(n.id);
                }
            }
            this.#lastNodesCount = allNodes.length;
        }

        const collectDescendantIds = (parentId: string) => {
            const children = this.#parentToChildren.get(parentId);
            if (children) {
                for (let i = 0; i < children.length; i++) {
                    const childId = children[i];
                    if (!moveIds.has(childId)) {
                        moveIds.add(childId);
                        collectDescendantIds(childId);
                    }
                }
            }
        };

        for (let i = 0; i < movingNodes.length; i++) {
            const n = movingNodes[i];
            if (n.lock) continue;
            moveIds.add(n.id);
            collectDescendantIds(n.id);
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < movingNodes.length; i++) {
            const n = movingNodes[i];
            if (n.x < minX) minX = n.x;
            if (n.y < minY) minY = n.y;
            if (n.x + n.width > maxX) maxX = n.x + n.width;
            if (n.y + n.height > maxY) maxY = n.y + n.height;
        }

        const snapRect: Rect = {
            x: minX + delta.dx,
            y: minY + delta.dy,
            width: maxX - minX,
            height: maxY - minY,
            rotate: movingNodes.length === 1 ? movingNodes[0].rotate : 0
        };

        const SEARCH_RADIUS = 2000;
        const others: Rect[] = [];
        for (let i = 0; i < allNodes.length; i++) {
            const n = allNodes[i];
            if (!moveIds.has(n.id) && !n.hide && !n.lock && n.id !== 'root') {
                if (Math.abs(n.x - snapRect.x) < SEARCH_RADIUS &&
                    Math.abs(n.y - snapRect.y) < SEARCH_RADIUS) {
                    others.push(n);
                }
            }
        }

        return this.checkAlignment(snapRect, others);
    }

    public checkAlignment(
        nodeRect: Rect,
        otherNodes: Rect[]
    ): SnapResult {
        this.clearLines();

        if (nodeRect.rotate && nodeRect.rotate !== 0) {
            this.syncToReactive();
            return { dx: 0, dy: 0 };
        }

        const snap = this.calculateSnapping(nodeRect, otherNodes);

        const snappedRect = {
            ...nodeRect,
            x: nodeRect.x + snap.dx,
            y: nodeRect.y + snap.dy
        };

        this.calculateMeasurements(snappedRect, otherNodes);

        this.syncToReactive();

        return snap;
    }

    private calculateSnapping(nodeRect: Rect, otherNodes: Rect[]): SnapResult {
        let snapDx = 0;
        let snapDy = 0;
        let closestDx = SNAP_THRESHOLD;
        let closestDy = SNAP_THRESHOLD;

        const xPoints = [nodeRect.x, nodeRect.x + nodeRect.width / 2, nodeRect.x + nodeRect.width];
        const yPoints = [nodeRect.y, nodeRect.y + nodeRect.height / 2, nodeRect.y + nodeRect.height];

        const vLines: AlignmentLine[] = [];
        const hLines: AlignmentLine[] = [];

        for (let i = 0; i < otherNodes.length; i++) {
            const target = otherNodes[i];

            // X-Axis Snapping
            const targetXPoints = [target.x, target.x + target.width / 2, target.x + target.width];
            for (let j = 0; j < 3; j++) {
                const tx = targetXPoints[j];
                for (let k = 0; k < 3; k++) {
                    const diff = tx - xPoints[k];
                    const absDiff = Math.abs(diff);

                    if (absDiff < closestDx) {
                        closestDx = absDiff;
                        snapDx = diff;
                        while(vLines.length) this.#linePool.push(vLines.pop()!);
                        const l = this.getPooledLine();
                        l.type = 'vertical'; l.pos = tx;
                        l.start = Math.min(nodeRect.y, target.y);
                        l.end = Math.max(nodeRect.y + nodeRect.height, target.y + target.height);
                        vLines.push(l);
                    } else if (absDiff < SNAP_THRESHOLD && absDiff === closestDx) {
                        const l = this.getPooledLine();
                        l.type = 'vertical'; l.pos = tx;
                        l.start = Math.min(nodeRect.y, target.y);
                        l.end = Math.max(nodeRect.y + nodeRect.height, target.y + target.height);
                        vLines.push(l);
                    }
                }
            }

            // Y-Axis Snapping
            const targetYPoints = [target.y, target.y + target.height / 2, target.y + target.height];
            for (let j = 0; j < 3; j++) {
                const ty = targetYPoints[j];
                for (let k = 0; k < 3; k++) {
                    const diff = ty - yPoints[k];
                    const absDiff = Math.abs(diff);

                    if (absDiff < closestDy) {
                        closestDy = absDiff;
                        snapDy = diff;
                        while(hLines.length) this.#linePool.push(hLines.pop()!);
                        const l = this.getPooledLine();
                        l.type = 'horizontal'; l.pos = ty;
                        l.start = Math.min(nodeRect.x, target.x);
                        l.end = Math.max(nodeRect.x + nodeRect.width, target.x + target.width);
                        hLines.push(l);
                    } else if (absDiff < SNAP_THRESHOLD && absDiff === closestDy) {
                        const l = this.getPooledLine();
                        l.type = 'horizontal'; l.pos = ty;
                        l.start = Math.min(nodeRect.x, target.x);
                        l.end = Math.max(nodeRect.x + nodeRect.width, target.x + target.width);
                        hLines.push(l);
                    }
                }
            }
        }

        if (vLines.length > 0) this.#rawLines.push(...vLines);
        if (hLines.length > 0) this.#rawLines.push(...hLines);

        return { dx: snapDx, dy: snapDy };
    }

    private calculateMeasurements(nodeRect: Rect, otherNodes: Rect[]) {
        const MAX_MEASURE_DIST = 500;

        for (let i = 0; i < otherNodes.length; i++) {
            const item = otherNodes[i];

            const yOverlap = Math.min(nodeRect.y + nodeRect.height, item.y + item.height) >
                           Math.max(nodeRect.y, item.y);

            if (yOverlap) {
                const dist = item.x > nodeRect.x ? item.x - (nodeRect.x + nodeRect.width) : nodeRect.x - (item.x + item.width);
                if (dist >= 0 && dist < MAX_MEASURE_DIST) {
                    const side = item.x > nodeRect.x ? 'right' : 'left';
                    this.addMeasurement('horizontal', nodeRect, item, dist, side);
                }
            }

            const xOverlap = Math.min(nodeRect.x + nodeRect.width, item.x + item.width) >
                           Math.max(nodeRect.x, item.x);

            if (xOverlap) {
                const dist = item.y > nodeRect.y ? item.y - (nodeRect.y + nodeRect.height) : nodeRect.y - (item.y + item.height);
                if (dist >= 0 && dist < MAX_MEASURE_DIST) {
                    const side = item.y > nodeRect.y ? 'bottom' : 'top';
                    this.addMeasurement('vertical', nodeRect, item, dist, side);
                }
            }
        }
    }

    private addMeasurement(type: 'horizontal' | 'vertical', nodeRect: Rect, item: Rect, dist: number, side: string) {
        const existingIdx = this.#rawMeasurements.findIndex(m => m.type === type &&
            ((side === 'right' && m.start === nodeRect.x + nodeRect.width) ||
             (side === 'left' && m.end === nodeRect.x) ||
             (side === 'bottom' && m.start === nodeRect.y + nodeRect.height) ||
             (side === 'top' && m.end === nodeRect.y)));

        if (existingIdx !== -1) {
            if (dist < this.#rawMeasurements[existingIdx].value) {
                this.#measPool.push(this.#rawMeasurements.splice(existingIdx, 1)[0]);
            } else {
                return;
            }
        }

        const m = this.getPooledMeas();
        m.type = type;
        m.value = Math.round(dist);

        if (type === 'horizontal') {
            const y = (Math.max(nodeRect.y, item.y) + Math.min(nodeRect.y + nodeRect.height, item.y + item.height)) / 2;
            m.start = side === 'right' ? nodeRect.x + nodeRect.width : item.x + item.width;
            m.end = side === 'right' ? item.x : nodeRect.x;
            m.pos = y;
            m.startExtend = { s: nodeRect.y, e: nodeRect.y + nodeRect.height };
            m.endExtend = { s: item.y, e: item.y + item.height };
        } else {
            const x = (Math.max(nodeRect.x, item.x) + Math.min(nodeRect.x + nodeRect.width, item.x + item.width)) / 2;
            m.start = side === 'bottom' ? nodeRect.y + nodeRect.height : item.y + item.height;
            m.end = side === 'bottom' ? item.y : nodeRect.y;
            m.pos = x;
            m.startExtend = { s: nodeRect.x, e: nodeRect.x + nodeRect.width };
            m.endExtend = { s: item.x, e: item.x + item.width };
        }
        this.#rawMeasurements.push(m);
    }
}

let alignmentExtension: AlignmentExtension | undefined;

export const useAlignment = function () {
    if (!alignmentExtension) alignmentExtension = new AlignmentExtension();
    return alignmentExtension;
};

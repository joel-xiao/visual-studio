import { computed } from 'vue';
import { Node } from './interface';

export function getNodeStyle(node: Node) {
  return computed<{
    'border-top-left-radius': string;
    'border-top-right-radius': string;
    'border-bottom-right-radius': string;
    'border-bottom-left-radius': string;
    width: string;
    height: string;
    '--node-width': string,
    '--node-height': string,
    overflow: string;
  }>(() => {
    const radius = node?.radius.map((r) => (r || 0) + 'px') || [];
    const width = (node?.width || 0) + 'px';
    const height = (node?.height || 0) + 'px';
    return {
      'border-top-left-radius': radius[0] || '0px',
      'border-top-right-radius': radius[1] || '0px',
      'border-bottom-right-radius': radius[2] || '0px',
      'border-bottom-left-radius': radius[3] || '0px',
      width: width,
      height: height,
      '--node-width': width,
      '--node-height': height,
      overflow: 'hidden'
    };
  });
}
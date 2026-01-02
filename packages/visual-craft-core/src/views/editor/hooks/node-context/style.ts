import { computed, unref, type MaybeRef, type Ref, type DeepReadonly } from 'vue';

type StyleNode = INode | DeepReadonly<INode>;

export function getNodeStyle(nodeOrRef: MaybeRef<StyleNode> | Readonly<Ref<StyleNode>>) {
  return computed<{
    'border-top-left-radius': string;
    'border-top-right-radius': string;
    'border-bottom-right-radius': string;
    'border-bottom-left-radius': string;
    width: string;
    height: string;
    '--node-width': string;
    '--node-height': string;
    overflow: string;
    transform: string;
  }>(() => {
    const node = unref(nodeOrRef);
    const radius = Array.isArray(node?.radius) ? node.radius.map(r => (r || 0) + 'px') : [];
    const width = (node?.width || 0) + 'px';
    const height = (node?.height || 0) + 'px';
    const rotate = (node?.rotate || 0) + 'deg';
    return {
      'border-top-left-radius': radius[0] || '0px',
      'border-top-right-radius': radius[1] || '0px',
      'border-bottom-right-radius': radius[2] || '0px',
      'border-bottom-left-radius': radius[3] || '0px',
      width: width,
      height: height,
      '--node-width': width,
      '--node-height': height,
      overflow: 'hidden',
      transform: `rotate(${rotate})`
    };
  });
}

export function getRootStyle(nodeOrRef: MaybeRef<StyleNode> | Readonly<Ref<StyleNode>>) {
  return computed(() => {
    const node = unref(nodeOrRef);
    const style = {
      width: (node?.width || 0) + 'px',
      height: (node?.height || 0) + 'px',
      'background-color': ''
    };

    if (node?.props?.fill?.color) {
      style['background-color'] = node.props.fill.color as string;
    }

    return style;
  });
}

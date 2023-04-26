import type { DefineComponent } from 'vue';
import { defineComponent, ref, readonly, withModifiers } from 'vue';

import DragResize from './components/drag-resize.vue';
import type { DargDataset } from '@d/darg-resize/interface';
import { useNodeContext } from './../hooks/node-context';
import { useComponentContext } from './../hooks/component-context';
import type { ComponentProps } from './../hooks/component-context/interface';

const ContainerNode = /*#__PURE__*/ defineComponent({
  name: 'ContainerNode',
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  setup(props, ctx) {
    const { getNode, getNodeStyle, updateNode, onSelectNode, addNodeInstance } = useNodeContext();
    const node = getNode(props.id);
    const nodeStyle = getNodeStyle(props.id);

    const dargDataset = readonly({
      x: node.x || 0,
      y: node.y || 0,
      x2: node.x + node.width,
      y2: node.y + node.height
    });
    const resize = ref<null | InstanceType<typeof DragResize>>(null);

    const setActive = function (val: boolean | undefined) {
      resize?.value?.setActive(val);
    };
    const updatePos = function () {
      resize?.value?.setPos({
        x: node.x || 0,
        y: node.y || 0,
        x2: node.x + node.width,
        y2: node.y + node.height
      });
    };
    addNodeInstance(node.id, { setActive, updatePos });

    const onDown = function (): void {
      onSelectNode(node.id);
    };

    const onResizing = function (dargDataset: DargDataset): void {
      updateNode(node.id, {
        x: dargDataset.x,
        y: dargDataset.y,
        width: dargDataset.x2 - dargDataset.x,
        height: dargDataset.y2 - dargDataset.y
      });
    };

    const { createNodeComponent } = useComponentContext();
    const render = () => {
      return (
        <>
          <DragResize
            ref={resize}
            data={dargDataset}
            onResizing={onResizing}
            // onMousedown={() => withModifiers(onDown, ['stop', 'prevent'])}
          >
            <div class="modal-node" style={nodeStyle.value}>
              {createNodeComponent(node.props as ComponentProps, node.component)}
            </div>
          </DragResize>
        </>
      );
    };
    return render;
  }
}) as DefineComponent;

export default ContainerNode;

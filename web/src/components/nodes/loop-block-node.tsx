import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { getNodeStyles } from '../../lib/node-styles';

type LoopBlockNode = Node<{ isActive?: boolean }, 'loopBlock'>;

export default function LoopBlockNode({ data }: NodeProps<LoopBlockNode>) {

    const styles = getNodeStyles({ ...data, type: 'loopBlock' });


    return (
        <div className={styles.card}>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}
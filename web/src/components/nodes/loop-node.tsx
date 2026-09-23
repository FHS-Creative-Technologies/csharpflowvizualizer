import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { RefreshCcw } from 'lucide-react';
import type { ControlStructureInfo } from '../../../types';
import { getNodeStyles } from '../../lib/node-styles';

type LoopNode = Node<ControlStructureInfo, 'loop'>;

export default function LoopNode({ data }: NodeProps<LoopNode>) {
    const styles = getNodeStyles(data);

    return (
        <div className={styles.wrapper}>
            <Handle type="target" position={Position.Top} />

            <Card className={styles.card}>
                <CardHeader className={styles.header}>
                    <RefreshCcw className="mr-2" />
                    <CardTitle>{data.type.toUpperCase()}</CardTitle>
                    <CardDescription>{data.Condition}</CardDescription>
                </CardHeader>
            </Card>

            <Handle type="source" position={Position.Bottom} />
            <Handle id="right-source" type="source" position={Position.Right} />
            <Handle id="right-target" type="target" position={Position.Right} />
        </div>
    );
}
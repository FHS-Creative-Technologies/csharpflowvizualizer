import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { SquareChartGantt } from 'lucide-react';
import type { MethodInfo } from '../../../types';
import { getNodeStyles } from '../../lib/node-styles';

type MethodNode = Node<MethodInfo & { branch?: boolean }, 'method'>;

export default function MethodNode({ data }: NodeProps<MethodNode>) {
    const styles = getNodeStyles(data);

    return (
        <div className={styles.wrapper}>
            <Handle type="target" position={Position.Top} />

            <Card className={styles.card}>
                <CardHeader className={styles.header}>
                    <SquareChartGantt className="mr-2" />
                    <CardTitle>{data.type.toUpperCase()}</CardTitle>
                    <CardDescription>{data.name}</CardDescription>
                </CardHeader>
            </Card>

            <Handle type="source" position={Position.Bottom} />
            <Handle id="right-source" type="source" position={Position.Right} />
            <Handle id="right-target" type="target" position={Position.Right} />
        </div>
    );
}
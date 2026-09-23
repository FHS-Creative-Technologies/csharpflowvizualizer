import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Split } from 'lucide-react';
import type { ControlStructureInfo } from '../../../types';
import { getNodeStyles } from '../../lib/node-styles';

type BranchNode = Node<ControlStructureInfo & { branch?: boolean }, 'branch'>;

export default function BranchNode({ data }: NodeProps<BranchNode>) {
    const styles = getNodeStyles(data);

    return (
        <div className={styles.wrapper}>
            <Handle type="target" position={Position.Top} />

            <Card className={styles.card}>
                <CardHeader className={styles.header}>
                    <Split className="mr-2" />
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
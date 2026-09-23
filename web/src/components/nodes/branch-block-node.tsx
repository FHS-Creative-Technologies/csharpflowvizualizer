import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Split } from 'lucide-react';
import { getNodeStyles } from '../../lib/node-styles';

type BranchBlockNode = Node<{ branch?: boolean; isActive?: boolean }, 'branchBlock'>;

export default function BranchBlockNode({ data }: NodeProps<BranchBlockNode>) {
    const styles = getNodeStyles({ ...data, type: 'branchBlock' });

    return (
        <div className={styles.wrapper}>
            <Handle type="target" position={Position.Top} />

            <Card className={styles.card}>
                <CardHeader className={styles.header}>
                    <Split className="mr-2" />
                    <CardTitle>Branch Block</CardTitle>
                </CardHeader>
            </Card>

            <Handle type="source" position={Position.Bottom} />
            <Handle id="right-source" type="source" position={Position.Right} />
            <Handle id="right-target" type="target" position={Position.Right} />
        </div>
    );
}
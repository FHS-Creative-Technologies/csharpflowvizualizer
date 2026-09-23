import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Folder } from 'lucide-react';
import type { ClassBaseInfo } from '../../../types';
import { getNodeStyles } from '../../lib/node-styles';

type ClassNode = Node<ClassBaseInfo & { branch?: boolean }, 'class'>;

export default function ClassNode({ data }: NodeProps<ClassNode>) {
    const styles = getNodeStyles(data);

    return (
        <div className={styles.wrapper}>
            <Handle type="target" position={Position.Top} />

            <Card className={styles.card}>
                <CardHeader className={styles.header}>
                    <Folder className="mr-2" />
                    <CardTitle>{data.type.toUpperCase()}</CardTitle>
                    <CardDescription className='text-inherit'>{data.name}</CardDescription>
                </CardHeader>
            </Card>

            <Handle type="source" position={Position.Bottom} />
            <Handle id="right-source" type="source" position={Position.Right} />
            <Handle id="right-target" type="target" position={Position.Right} />
        </div>
    );
}
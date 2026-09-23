import {
    BaseEdge,
    type EdgeProps,
    type Edge,
    getBezierPath,
    EdgeLabelRenderer
} from '@xyflow/react';

type CustomEdge = Edge<{ value: number }, 'custom'>;

export default function DirectedEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    label
}: EdgeProps<CustomEdge>) {
    const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });

    return (
        <>
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                        zIndex: 10,
                    }}

                >
                    {label && (
                        <div className='bg-white p-2 border-black border rounded-sm min-w-16 text-center text-black text-sm'>
                            {label}
                        </div>

                    )}
                </div>
            </EdgeLabelRenderer>
            <BaseEdge id={id} path={edgePath} style={{
                stroke: 'black',
                strokeWidth: 2,
            }}
                markerEnd="url(#arrow-black)"
            />

        </>
    );
}
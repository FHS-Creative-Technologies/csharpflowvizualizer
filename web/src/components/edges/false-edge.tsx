import {
    BaseEdge,
    type EdgeProps,
    type Edge,
    EdgeLabelRenderer,
    getSmoothStepPath
} from '@xyflow/react';

type CustomEdge = Edge<{ value: number }, 'custom'>;

export default function FalseEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    label
}: EdgeProps<CustomEdge>) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY });

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
                        <div className='bg-red-800 p-2 rounded-sm min-w-16 text-center text-white text-sm'>
                            {label}
                        </div>

                    )}
                </div>
            </EdgeLabelRenderer>
            <BaseEdge id={id} path={edgePath} style={{
                stroke: 'oklch(44.4% 0.177 26.899)',
                strokeWidth: 2,
            }}
                markerEnd="url(#arrow-red)" />
        </>
    );
}
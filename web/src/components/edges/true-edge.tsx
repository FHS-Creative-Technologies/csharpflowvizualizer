import {
    BaseEdge,
    type EdgeProps,
    type Edge,
    EdgeLabelRenderer,
    getSmoothStepPath
} from '@xyflow/react';

type CustomEdge = Edge<{ value: number }, 'custom'>;


export default function TrueEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    label,
    sourcePosition,
    targetPosition
}: EdgeProps<CustomEdge>) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });


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
                        <div className='bg-emerald-800 p-2 rounded-sm min-w-16 text-center text-white text-sm'>
                            {label}
                        </div>

                    )}
                </div>
            </EdgeLabelRenderer>
            <BaseEdge id={id} path={edgePath} style={{
                stroke: 'oklch(43.2% 0.095 166.913)',
                strokeWidth: 2,
            }}
                markerEnd="url(#arrow-emerald)" />
        </>
    );
}


import {
    type EdgeProps,
    type Edge,
    EdgeLabelRenderer,
} from '@xyflow/react';
import { minNodeWidth } from '../../lib/chart-helper';

type ReboundEdge = Edge<{ value: number }, 'custom'>;

export default function ReboundEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    label
}: EdgeProps<ReboundEdge>) {

    const xOffset = minNodeWidth / 4; // Distance to move right

    // Create a rectangular path: right -> down -> back left
    const edgePath = `
        M ${sourceX} ${sourceY}
        L ${sourceX + xOffset} ${sourceY}
        L ${sourceX + xOffset} ${targetY}
        L ${targetX} ${targetY}
    `;

    const labelX = sourceX + xOffset / 2;
    const labelY = (sourceY + targetY) / 2;

    return (
        <>
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(50%, -50%) translate(${labelX + 20}px, ${labelY}px)`,
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
            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    overflow: 'visible',
                    zIndex: 0,
                }}
            >
                <path
                    id={id}
                    d={edgePath}
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrow-black)"
                />
            </svg>
        </>
    );
}

import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import BranchNode from './nodes/branch-node';
import type { BaseInfo } from '../../types';
import type { HighlightLinePayload } from '../../../src/messages';
import CodeBlockNode from './nodes/code-block-node';
import LoopNode from './nodes/loop-node';
import MethodNode from './nodes/method-node';
import ClassNode from './nodes/class-node';
import { formatDataForChart } from '../lib/chart-helper';
import BranchBlockNode from './nodes/branch-block-node';
import { useEffect, useMemo, useState } from 'react';
import TrueEdge from './edges/true-edge';
import FalseEdge from './edges/false-edge';
import DirectedEdge from './edges/directed-edge';
import LoopBlockNode from './nodes/loop-block-node';
import ReboundEdge from './edges/rebound-edge';
import type { Node } from '@xyflow/react';
import { CLASS_TYPES_VALUES, METHOD_TYPES_VALUES } from '../../constants';

const nodeTypes = {
    branch: BranchNode,
    branchBlock: BranchBlockNode,
    loopBlock: LoopBlockNode,
    codeBlock: CodeBlockNode,
    loop: LoopNode,
    method: MethodNode,
    class: ClassNode
};

const edgeTypes = {
    trueEdge: TrueEdge,
    falseEdge: FalseEdge,
    directedEdge: DirectedEdge,
    reboundEdge: ReboundEdge
};

const defaultEdgeOptions = { zIndex: 1 };


export function Chart({ data, activeLine, highlightedRange, handleNodeClick }: { data?: BaseInfo[] | null, activeLine?: number | null, highlightedRange?: HighlightLinePayload | null, handleNodeClick: (node: Node<BaseInfo>) => void }) {
    const { nodes: rawNodes, edges } = useMemo(() => formatDataForChart({ data }), [data]);


    const nodes = useMemo(() => {
        const hasHighlightedRange = highlightedRange != null;

        // if no active line is set
        if (!hasHighlightedRange && activeLine == null) {
            return rawNodes.map((node: Node) => ({
                ...node,
                data: {
                    ...(node.data as BaseInfo),
                    isActive: undefined
                }
            }));
        }

        let nextActiveIndex: number | null = null;
        let smallestRange = Infinity;

        rawNodes.forEach((node: Node, index: number) => {
            const blockData = node.data as BaseInfo;

            const matchesHighlightedRange = highlightedRange != null
                && blockData.startLine <= highlightedRange.startLine
                && blockData.endLine >= highlightedRange.endLine;

            const matchesActiveLine = activeLine != null
                && blockData.startLine <= activeLine
                && blockData.endLine >= activeLine;

            if (matchesHighlightedRange || (!hasHighlightedRange && matchesActiveLine)) {
                const nodeRange = blockData.endLine - blockData.startLine;
                console.log(`Node ${node.id} range:`, nodeRange, `(start: ${blockData.startLine}, end: ${blockData.endLine})`);
                if (nodeRange < smallestRange) {
                    smallestRange = nodeRange;
                    nextActiveIndex = index;
                }
            }
        });


        if (nextActiveIndex == null) {
            console.warn("No active node found for activeLine:", activeLine);
            return rawNodes.map((node: Node) => ({
                ...node,
                data: {
                    ...(node.data as BaseInfo),
                    isActive: undefined
                }
            }));
        }

        const nextActiveNode = rawNodes[nextActiveIndex];
        console.log("Next active node:", nextActiveNode);

        return rawNodes.map((node: Node, index: number) => {

            if (
                nextActiveNode.type == 'branchBlock' ||
                nextActiveNode.type == 'loopBlock' ||
                // nextActiveNode.type != 'codeBlock' &&
                CLASS_TYPES_VALUES.includes(nextActiveNode.data.type as string) ||
                METHOD_TYPES_VALUES.includes(nextActiveNode.data.type as string)
            ) {
                if (node.parentId == nextActiveNode.id) {
                    console.log(nextActiveNode.id, nextActiveNode.parentId, "Activating parent node:", node.type, node.id, node.parentId);

                    return {
                        ...node,
                        data: {
                            ...(node.data as BaseInfo),
                            isActive: true
                        }
                    }
                }
            }


            return {
                ...node,
                data: {
                    ...(node.data as BaseInfo),
                    isActive: index === nextActiveIndex
                }
            }
        });
    }, [rawNodes, activeLine, highlightedRange]);


    const [height, setHeight] = useState(window.innerHeight - 120);

    useEffect(() => {
        const handleResize = () => {
            setHeight(window.innerHeight - 120);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, []);

    return (
        <div style={{ width: "100%", height: height - 140, minHeight: 200 }}>
            <ReactFlow<Node<BaseInfo>>
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                nodes={nodes}
                edges={edges}
                defaultEdgeOptions={defaultEdgeOptions}
                minZoom={0.1}
                maxZoom={1}
                attributionPosition='top-right'
                nodesDraggable={true}
                panOnDrag={true}
                onNodeClick={(_, node) => { handleNodeClick(node) }}
            >
                <Background variant={BackgroundVariant.Dots} />
                <MiniMap nodeColor="transparent" nodeStrokeColor={'black'} nodeStrokeWidth={10} />
                <Controls />
            </ReactFlow>

            {/* arrow black */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <marker
                        id="arrow-black"
                        viewBox="0 0 10 10"
                        refX="10"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
                    </marker>
                </defs>
            </svg>
            {/* arrow emerald */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <marker
                        id="arrow-emerald"
                        viewBox="0 0 10 10"
                        refX="10"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="oklch(43.2% 0.095 166.913)" />
                    </marker>
                </defs>
            </svg>
            {/* arrow red */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <marker
                        id="arrow-red"
                        viewBox="0 0 10 10"
                        refX="10"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="oklch(44.4% 0.177 26.899)" />
                    </marker>
                </defs>
            </svg>
        </div>
    );
}





import type { Edge, Node } from "@xyflow/react";
import type { BaseInfo, ClassBaseInfo, ControlStructureInfo, MethodInfo } from "../../types";
import {
    CLASS_TYPES_VALUES,
    CONTROL_STRUCTURE_TYPES_VALUES,
    ITERATION_TYPES_VALUES,
    METHOD_TYPES_VALUES,
    type CLASS_TYPES,
    type CONTROL_STRUCTURE_TYPES,
    type ITERATION_TYPES,
    type METHOD_TYPES
} from "../../constants";

type ChartResult = {
    nodes: Node[];
    edges: Edge[];
    neededHeight: number;
    neededWidth: number;
};

type ChartPartResult = {
    parentNode: Node;
    childNodes: Node[];
    edges: Edge[];
    neededHeight: number;
    neededWidth: number;
};

export const nodeHeaderHeight = 64;
export const minNodeWidth = 300;
export const paddingY = 36;
export const paddingX = 56;
export const gap = 72;
export const trueLabelWidth = 70;

export function formatDataForChart({
    data,
}: {
    data?: BaseInfo[] | null;
}): ChartResult {

    const result = iterateOverBlocks({ data });

    return result;
}

export function iterateOverBlocks({
    data,
    id,
    parentId,
    position = { x: 0, y: 0 },
    createParentEdges = true
}: {
    data?: BaseInfo[] | null;
    id?: string;
    parentId?: string;
    position?: { x: number; y: number };
    createParentEdges?: boolean;
}): ChartResult {

    const parentNodes: Node[] = [];
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let neededWidth = 0;
    let index = 0;

    const pos = { ...position };

    let previousType;
    let controlStructureInfos: ControlStructureInfo[] = [];

    for (const block of data || []) {

        const blockType = block.type;
        let newParentId: string = `${index}`;

        if (id) {
            newParentId = `${id}-${index}`;
        } else if (parentId) {
            newParentId = `${parentId}-${index}`;
        }

        let result: ChartPartResult | null = null;

        // if the previous type was a control structure and the current type is not a control structure, it means that we have finished iterating over the control structure blocks and we need to handle them
        // if the current type and previous type are both if, the block is finished
        if (
            previousType &&
            controlStructureInfos.length > 0 &&
            CONTROL_STRUCTURE_TYPES_VALUES.includes(previousType as CONTROL_STRUCTURE_TYPES) &&
            (!CONTROL_STRUCTURE_TYPES_VALUES.includes(blockType as CONTROL_STRUCTURE_TYPES) || ((previousType as CONTROL_STRUCTURE_TYPES) === "If" && (blockType as CONTROL_STRUCTURE_TYPES) == 'If'))
        ) {


            const controlResult = handleControlStructureBlockType({
                blocks: controlStructureInfos,
                parentId: parentId,
                id: newParentId,
                position: { x: pos.x, y: pos.y }
            });
            controlStructureInfos = [];

            neededWidth = Math.max(neededWidth, controlResult.neededWidth);

            parentNodes.push(controlResult.parentNode);

            nodes.push(...controlResult.childNodes);
            edges.push(...controlResult.edges);

            pos.y += controlResult.neededHeight;
            pos.y += ((data?.length || 1) - 1 > index - 1 ? gap : 0);

        }

        switch (blockType) {
            // class, namespace
            case CLASS_TYPES_VALUES.includes(blockType as CLASS_TYPES) ? blockType as CLASS_TYPES : null: {
                result = handleClassBlockType({
                    block: (block as ClassBaseInfo),
                    parentId: parentId,
                    id: newParentId,
                    position: { x: pos.x, y: pos.y }
                });

                break;
            }
            // method, constructor, local function
            case METHOD_TYPES_VALUES.includes(blockType as METHOD_TYPES) ? blockType as METHOD_TYPES : null: {
                result = handleMethodBlockType({
                    block: (block as MethodInfo),
                    parentId: parentId,
                    id: newParentId,
                    position: { x: pos.x, y: pos.y }
                });

                break;
            }
            // if, else if, else
            case CONTROL_STRUCTURE_TYPES_VALUES.includes(blockType as CONTROL_STRUCTURE_TYPES) ? blockType as CONTROL_STRUCTURE_TYPES : null: {
                controlStructureInfos.push(block as ControlStructureInfo);
                break;
            }
            // for, while, do while, for each
            case ITERATION_TYPES_VALUES.includes(blockType as ITERATION_TYPES) ? blockType as ITERATION_TYPES : null: {
                result = handleIterationBlockType({
                    block: (block as ControlStructureInfo),
                    parentId: parentId,
                    id: newParentId,
                    position: { x: pos.x, y: pos.y },
                });

                break;
            }
            // code block
            default: {
                result = handleCodeBlockType({
                    block,
                    id: newParentId,
                    parentId: parentId,
                    position: { x: pos.x, y: pos.y }
                });


                break;
            }
        }

        // add gap if not control structure, because control 
        if (!CONTROL_STRUCTURE_TYPES_VALUES.includes(blockType as CONTROL_STRUCTURE_TYPES)) {
            pos.y += ((data?.length || 1) - 1 > index ? gap : 0);
        }

        // center nodes
        if (result) {
            neededWidth = Math.max(neededWidth, result.neededWidth);

            parentNodes.push(result.parentNode);

            nodes.push(...result.childNodes);
            edges.push(...result.edges);

            pos.y += result.neededHeight;
        }

        index++;
        previousType = blockType;


    }

    // if controlStructureInfos is not empty, it means that the last blocks were control structures, so we need to handle them
    if (previousType && controlStructureInfos.length > 0 && CONTROL_STRUCTURE_TYPES_VALUES.includes(previousType as CONTROL_STRUCTURE_TYPES)) {

        const newParentId = id
            ? `${id}-${index}`
            : parentId
                ? `${parentId}-${index}`
                : `${index}`;
        const result = handleControlStructureBlockType({
            blocks: controlStructureInfos,
            parentId: parentId,
            id: newParentId,
            position: { x: pos.x, y: pos.y }
        });
        controlStructureInfos = [];

        parentNodes.push(result.parentNode);
        nodes.push(...result.childNodes);
        edges.push(...result.edges);

        neededWidth = Math.max(neededWidth, result.neededWidth);

        pos.y += result.neededHeight;
        // not needed always last
        // pos.y += (data?.length - 1 > index ? gap : 0);

    }

    // center parent nodes 
    parentNodes.forEach(parentNode => {
        parentNode.position = {
            x: parentNode.position.x + (neededWidth - (parentNode.width || 0)) / 2,
            y: parentNode.position.y
        };
    });


    if (createParentEdges) {
        let previousParentNode: Node | null = null;
        // add edges between parent nodes
        parentNodes.forEach(parentNode => {

            if (previousParentNode && previousParentNode.type !== "class" && previousParentNode.type !== "method" && parentNode.type !== "class" && parentNode.type !== "method") {
                const edge: Edge = {
                    id: `${previousParentNode.id}->${parentNode.id}`,
                    source: previousParentNode.id,
                    target: parentNode.id,
                    type: "directedEdge",
                };
                edges.push(edge);
            }
            previousParentNode = parentNode;
        });
    }

    const neededHeight = Math.max(0, pos.y - position.y);

    return { nodes: [...parentNodes, ...nodes], edges: edges, neededHeight: neededHeight, neededWidth: neededWidth };
}

function createNode({
    id,
    type,
    nodeData,
    props
}: {
    id: string;
    type: string;
    nodeData: BaseInfo | ClassBaseInfo | ControlStructureInfo | MethodInfo;
    props?: Partial<Node>;
}): Node {
    const node: Node = {
        id,
        type,
        position: {
            x: 0,
            y: 0
        },
        data: nodeData,
        ...(props as object),
        draggable: false,
    } as Node;
    return node;
}

function handleClassBlockType({
    block,
    parentId,
    id,
    position = { x: 0, y: 0 }
}: {
    block: ClassBaseInfo;
    parentId?: string;
    id: string;
    position?: { x: number; y: number };
}): ChartPartResult {


    const node = createNode({
        id,
        type: "class",
        nodeData: block,
        props: {
            parentId,
            width: minNodeWidth,
            position: {
                x: position.x,
                y: position.y
            }
        }
    });

    const result = iterateOverBlocks({
        data: block.children,
        parentId: id,
        position: {
            x: paddingX, // add padding left
            // move the child nodes down by the height of the header
            y: nodeHeaderHeight + paddingY // add padding top
        }
    });



    node.position = position;
    // the needed height is the height of the header + the height of the children
    node.width = Math.max(minNodeWidth, result.neededWidth) + 2 * paddingX; // add padding left and right
    node.height = nodeHeaderHeight + result.neededHeight + 2 * paddingY; // add padding top and bottom

    return {
        edges: [...result.edges],
        neededHeight: node.height,
        neededWidth: node.width,
        parentNode: node,
        childNodes: result.nodes
    };
}

function handleMethodBlockType({
    block,
    parentId,
    id,
    position = { x: 0, y: 0 }
}: {
    block: MethodInfo;
    parentId?: string;
    id: string;
    position?: { x: number; y: number };
}): ChartPartResult {


    const node = createNode({
        id,
        type: "method",
        nodeData: block,
        props: {
            parentId,
            width: minNodeWidth,
            position: {
                x: position.x,
                y: position.y
            }
        }
    });

    const result = iterateOverBlocks({
        data: block.children,
        parentId: id,
        position: {
            x: paddingX, // add padding left
            // move the child nodes down by the height of the header
            y: nodeHeaderHeight + paddingY // add padding top
        }
    });


    // the needed height is the height of the header + the height of the children
    node.width = Math.max(minNodeWidth, result.neededWidth) + 2 * paddingX; // add padding left and right
    node.height = nodeHeaderHeight + result.neededHeight + 2 * paddingY; // add padding top and bottom


    return {
        parentNode: node,
        childNodes: result.nodes,
        edges: [...result.edges],
        neededHeight: node.height,
        neededWidth: node.width
    };
}

function handleCodeBlockType({
    block,
    parentId,
    id,
    position = { x: 0, y: 0 }
}: {
    block: BaseInfo;
    parentId?: string;
    id: string;
    position?: { x: number; y: number };
}): ChartPartResult {


    const node = createNode({
        id,
        type: "codeBlock",
        nodeData: block,
        props: {
            parentId,
            width: minNodeWidth,
            height: nodeHeaderHeight,
            position: position
        }
    });

    return {
        parentNode: node,
        childNodes: [],
        edges: [],
        neededHeight: nodeHeaderHeight,
        neededWidth: minNodeWidth
    };
}

// TODO: adapt for correct handling
function handleIterationBlockType({
    block,
    parentId,
    id,
    position = { x: 0, y: 0 }
}: {
    block: ControlStructureInfo;
    parentId?: string;
    id: string;
    position?: { x: number; y: number };
}): ChartPartResult {

    const node = createNode({
        id,
        type: "loopBlock",
        nodeData: block,
        props: {
            parentId,
            width: minNodeWidth,
            position: {
                x: position.x,
                y: position.y
            }
        }
    });

    const loopNode = createNode({
        id: `${id}-loop`,
        type: "loop",
        nodeData: block,
        props: {
            parentId: node.id,
            width: minNodeWidth,
            height: nodeHeaderHeight,
            position: {
                x: paddingX,
                y: paddingY
            }
        }
    });

    let result;

    if (block.type === "DoWhile") {
        result = iterateOverBlocks({
            data: block.children,
            parentId: id,
            position: {
                x: paddingX, // add padding left
                // move the child nodes down by the height of the header
                y: paddingY // add padding top
            }
        });

        loopNode.position = {
            x: paddingX,
            y: result.neededHeight + gap // add padding top and the height of the children
        }

    } else {
        result = iterateOverBlocks({
            data: block.children,
            parentId: id,
            position: {
                x: paddingX, // add padding left
                // move the child nodes down by the height of the header
                y: nodeHeaderHeight + 1.5 * gap + paddingY // add padding top
            }
        });

    }

    // search for the last parent node
    let lastParentNode: Node | undefined = undefined;
    result.nodes.forEach(node => {
        if (node.parentId === id) {
            lastParentNode = node;
        }
    });

    const firstIterationEdge: Edge = {
        id: node.id,
        source: loopNode.id,
        target: result.nodes[0]?.id,
        type: "directedEdge",
    };

    if (!lastParentNode) {
        lastParentNode = loopNode;
    }

    const lastIterationEdge: Edge = {
        id: `${result.nodes[result.nodes.length - 1]?.id}-backToLoop`,
        source: lastParentNode.id,
        target: loopNode.id,
        targetHandle: "right-target",
        sourceHandle: "right-source",
        type: "reboundEdge",
    };


    // the needed height is the height of the header + the height of the children
    node.width = Math.max(minNodeWidth, result.neededWidth) + 2 * paddingX; // add padding left and right
    node.height = nodeHeaderHeight + result.neededHeight + 3 * paddingY; // add padding top and bottom
    loopNode.width = node.width - 2 * paddingX;
    node.width = node.width + minNodeWidth / 4; // add extra width for the label of the edge

    if (block.type === "DoWhile") {
        // swap source and target of the edges for do while loop, because the condition is checked after the first iteration
        firstIterationEdge.source = result.nodes[0]?.id;
        firstIterationEdge.target = loopNode.id;
        lastIterationEdge.source = loopNode.id;
        lastIterationEdge.target = lastParentNode.id;
        lastIterationEdge.label = "True";

        loopNode.position = {
            x: paddingX,
            y: loopNode.position.y + paddingY
        }

        node.height += paddingY; // add gap for the label of the edge
        node.width += trueLabelWidth; // add extra width for the label of the edge

    } else {
        firstIterationEdge.label = "True";
        node.height += paddingY + 0.5 * gap; // add gap for the label of the edge
    };



    return {
        parentNode: node,
        childNodes: [loopNode, ...result.nodes],
        edges: [firstIterationEdge, lastIterationEdge, ...result.edges],
        neededHeight: node.height, // add padding for label
        neededWidth: node.width + minNodeWidth / 4
    };
}

function handleControlStructureBlockType({
    blocks,
    parentId,
    id,
    position = { x: 0, y: 0 }
}: {
    blocks: ControlStructureInfo[];
    parentId?: string;
    id: string;
    position?: { x: number; y: number };
}): ChartPartResult {


    const nodes: { left: Node[], right: Node[] } = { left: [], right: [] };
    const edges: Edge[] = [];

    let neededWidth = { left: 0, right: 0 };
    let neededHeight = 0;
    let previousNeededHeight = 0;

    const pos = { ...position };
    let index = 0;

    const controlStructureRange = {
        ...blocks[0],
        startLine: Math.min(...blocks.map(block => block.startLine)),
        endLine: Math.max(...blocks.map(block => block.endLine)),
    };

    const parentNode = createNode({
        id: `${id}-branchBlock`,
        type: "branchBlock",
        nodeData: controlStructureRange,
        props: {
            parentId,
            width: minNodeWidth,
            position: pos
        }
    });
    index++;



    neededHeight = nodeHeaderHeight + paddingY; // padding top
    neededWidth = { left: paddingX, right: 0 }; // padding left and right



    // iterate over the condition blocks
    for (const block of blocks) {

        const conditionId = `${id}-condition-${index}`;

        // only add a branch node for if and else
        if (block.type === "If" || block.type === "ElseIf") {

            // create the if or else if node
            const conditionNode = createNode({
                id: conditionId,
                type: "branch",
                nodeData: block,
                props: {
                    parentId: parentNode.id,
                    width: minNodeWidth,
                    height: nodeHeaderHeight,
                    position: {
                        x: paddingX,
                        y: neededHeight
                    }
                },
            });

            // add gap
            neededHeight += gap;

            const result = iterateOverBlocks({
                data: block.children,
                id: conditionId + "-if-child",
                parentId: parentNode.id,
                createParentEdges: false,
                position: {
                    x: paddingX, // add padding left
                    y: neededHeight + nodeHeaderHeight
                }
            });



            neededWidth.left = Math.max(neededWidth.left, result.neededWidth + minNodeWidth + paddingX); // add the width of the condition node and padding right
            // update the x position of the condition node 
            conditionNode.position = {
                // use the updated needed width to position the condition node in the middle of the children nodes
                x: neededWidth.left - minNodeWidth, // neededWidth includes the width of the condition node
                y: neededHeight - gap
            };

            // center the parent node based on the needed width
            nodes.left.push(conditionNode, ...result.nodes);
            edges.push(...result.edges);

            previousNeededHeight = nodeHeaderHeight + result.neededHeight;
            neededHeight += nodeHeaderHeight + result.neededHeight + gap;

        } else {
            const result = iterateOverBlocks({
                data: block.children,
                id: conditionId + "-else-child",
                parentId: parentNode.id,
                createParentEdges: false,
                position: {
                    x: neededWidth.left,
                    y: neededHeight - previousNeededHeight + nodeHeaderHeight - gap
                }
            });

            nodes.right.push(...result.nodes);
            edges.push(...result.edges);

            neededHeight += Math.max(previousNeededHeight, nodeHeaderHeight + result.neededHeight) - previousNeededHeight;
            neededWidth.right += result.neededWidth;
        }

        // update the position for the next node
        index++;
    }

    neededWidth.right += paddingX; // add padding right

    // the needed height is the height of the header + the height of the children
    parentNode.width = Math.max(minNodeWidth, neededWidth.left + neededWidth.right); // add padding right
    parentNode.height = neededHeight + paddingY - gap; // padding bottom

    const { nodes: leftCenteredNodes, edges: leftCenteredEdges, lastBranchNode } = centerLeftNodes(nodes.left, parentNode, neededWidth);
    nodes.left = leftCenteredNodes;
    edges.push(...leftCenteredEdges);



    const { nodes: rightCenteredNodes, edges: rightCenteredEdges } = centerRightNodes(nodes.right, parentNode, lastBranchNode, neededWidth);
    nodes.right = rightCenteredNodes;
    edges.push(...rightCenteredEdges);

    return {
        parentNode,
        childNodes: [...nodes.left, ...nodes.right],
        edges: [...edges],
        neededHeight: parentNode.height,
        neededWidth: parentNode.width
    };
}

function centerLeftNodes(nodes: Node[], parentNode: Node, neededWidth: { left: number; right: number }): { nodes: Node[], edges: Edge[], lastBranchNode: Node | null } {

    const edges: Edge[] = [];

    let lastLeftNode: Node | null = null;
    let lastLeftBranchNode: Node | null = null;
    nodes.forEach((node, idx) => {
        // center nodes under the branch node
        if (node.parentId == parentNode.id && node.type !== "branch") {
            const availableWidth = neededWidth.left - (node.width || 0) - paddingX - minNodeWidth;
            node.data.branch = true;
            node.position = {
                x: paddingX + (availableWidth / 2),
                y: node.position.y
            };
        }

        // add edge
        if (node.parentId == parentNode.id) {

            // connect child nodes with edges
            if (lastLeftNode != null && idx < nodes.length && node.type !== "branch") {
                const edge: Edge = {
                    id: `${lastLeftNode.id}->${node.id}`,
                    source: lastLeftNode.id,
                    target: node.id,
                    type: "trueEdge",
                    label: (lastLeftNode.id == nodes[idx - 1].id && nodes[idx - 1].type === "branch") || node.type === "branch" ? "True" : undefined,
                };
                edges.push(edge);
            }

            // connect branch nodes with edges
            if (node.type === "branch") {
                if (lastLeftBranchNode != null) {
                    const edge: Edge = {
                        id: `${lastLeftBranchNode.id}->${node.id}`,
                        source: lastLeftBranchNode.id,
                        target: node.id,
                        type: "falseEdge",
                        label: "False",
                    };
                    edges.push(edge);
                }
                lastLeftBranchNode = node;
            }
            lastLeftNode = node;
        }
    });

    return { nodes, edges, lastBranchNode: lastLeftBranchNode };
}

function centerRightNodes(nodes: Node[], parentNode: Node, lastBranchNode: Node | null, neededWidth: { left: number; right: number }): { nodes: Node[], edges: Edge[] } {

    const edges: Edge[] = [];

    let lastRightNode: Node | null = lastBranchNode;

    nodes.forEach((node, idx) => {
        // center nodes under the branch node
        if (node.parentId == parentNode.id && node.type !== "branch") {
            const availableWidth = neededWidth.right - (node.width || 0);
            node.data.branch = false;
            node.position = {
                x: neededWidth.left + (availableWidth / 2),
                y: node.position.y
            };
        }

        // add edge
        if (node.parentId == parentNode.id) {

            // connect child nodes with edges
            if (lastRightNode != null && idx < nodes.length && node.type !== "branch") {
                const edge: Edge = {
                    id: `${lastRightNode.id}->${node.id}`,
                    source: lastRightNode.id,
                    target: node.id,
                    type: "falseEdge",
                    label: lastRightNode.type === "branch" ? "False" : undefined,
                };
                edges.push(edge);
            }


            lastRightNode = node;
        }
    });

    return { nodes, edges };
}
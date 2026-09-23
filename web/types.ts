import { type CLASS_TYPES, type METHOD_TYPES, type CONTROL_STRUCTURE_TYPES, type ITERATION_TYPES } from './constants';

export type BaseInfo = {
    type: CLASS_TYPES | METHOD_TYPES | CONTROL_STRUCTURE_TYPES | ITERATION_TYPES;
    startLine: number;
    endLine: number;
    text: string;
    isActive?: boolean | undefined;
};

type BlockBaseInfo = BaseInfo & {
    children: BaseInfo[];
};

export type ClassBaseInfo = BlockBaseInfo & {
    name: string;
    modifiers: string;
};

export type ControlStructureInfo = BlockBaseInfo & {
    Condition: string;
};

export type MethodInfo = ClassBaseInfo & {
    parameters: string[];
    returnType: string;
}
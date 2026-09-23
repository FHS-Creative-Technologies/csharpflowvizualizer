
export const CLASS_TYPES_VALUES = [
    'Namespace',
    'Class',
];


export type CLASS_TYPES = (typeof CLASS_TYPES_VALUES)[number];
export const METHOD_TYPES_VALUES = [
    'Constructor',
    'Method',
    'LocalFunction',
];
export type METHOD_TYPES = (typeof METHOD_TYPES_VALUES)[number];
export const CONTROL_STRUCTURE_TYPES_VALUES = [
    'If',
    'ElseIf',
    'Else',
];
export type CONTROL_STRUCTURE_TYPES = (typeof CONTROL_STRUCTURE_TYPES_VALUES)[number];
export const ITERATION_TYPES_VALUES = [
    'For',
    'While',
    'DoWhile',
    'ForEach',
];

export type ITERATION_TYPES = (typeof ITERATION_TYPES_VALUES)[number];
import { type CLASS_TYPES, type METHOD_TYPES, type CONTROL_STRUCTURE_TYPES, type ITERATION_TYPES, CLASS_TYPES_VALUES, METHOD_TYPES_VALUES, CONTROL_STRUCTURE_TYPES_VALUES, ITERATION_TYPES_VALUES } from '../../constants';
import { cn } from './utils';

export type NodeStyleInput = {
    isActive?: boolean;
    branch?: boolean;
    type?: CLASS_TYPES | METHOD_TYPES | CONTROL_STRUCTURE_TYPES | ITERATION_TYPES;
};

const blockTypes = ['branchBlock', 'loopBlock', 'codeBlock'] as const;
const baseWrapperClass = 'h-full w-full rounded-lg transition-all duration-200';
const baseCardClass = 'h-full w-full overflow-hidden rounded-lg border-2 shadow-xs p-0';
const baseHeaderClass = 'p-4 gap-4 flex flex-row items-center';

function getBorderClass(baseBorderClass: string, { isActive, branch }: Pick<NodeStyleInput, 'isActive' | 'branch'>) {
    if (isActive === false) {
        return 'border-gray-300';
    }

    if (branch === true) {
        return 'border-emerald-800';
    }

    if (branch === false) {
        return 'border-red-800';
    }

    return baseBorderClass;
}

function getRingClass(baseRingClass: string, { isActive, branch }: Pick<NodeStyleInput, 'isActive' | 'branch'>) {
    if (isActive === false) {
        return '';
    }

    if (branch === true) {
        return 'ring-2 ring-emerald-200';
    }

    if (branch === false) {
        return 'ring-2 ring-red-200';
    }

    if (isActive === true) {
        return baseRingClass;
    }

    return '';
}

export function getNodeStyles({ isActive, branch, type }: NodeStyleInput) {


    if (type && CLASS_TYPES_VALUES.includes(type)) {
        return getClassNodeStyles({ isActive, branch, type });
    }

    if (type && (METHOD_TYPES_VALUES.includes(type as METHOD_TYPES))) {
        return getMethodNodeStyles({ isActive, branch, type });
    }

    if (type && CONTROL_STRUCTURE_TYPES_VALUES.includes(type as CONTROL_STRUCTURE_TYPES)) {
        return getControlStructureNodeStyles({ isActive, branch, type });
    }

    if (type && ITERATION_TYPES_VALUES.includes(type as ITERATION_TYPES)) {
        return getIterationNodeStyles({ isActive, branch, type });
    }

    if (type && blockTypes.includes(type as typeof blockTypes[number])) {
        return getBlockNodeStyles({ isActive, branch, type });
    }

    // Default styles should never be used, but we return something to avoid errors
    return {
        wrapper: cn(
            baseWrapperClass,
            getRingClass('ring-2 ring-slate-200', { isActive, branch })
        ),
        card: cn(
            baseCardClass,
            getBorderClass('border-slate-300', { isActive, branch })
        ),
        header: cn(
            baseHeaderClass
        ),
    };


}

function getBlockNodeStyles({ isActive, branch, type }: NodeStyleInput) {
    switch (type) {
        case 'branchBlock':
            return {
                wrapper: cn(
                    baseWrapperClass,
                    getRingClass('ring-2 ring-gray-200', { isActive, branch })
                ),
                card: cn(
                    baseCardClass,
                    getBorderClass('border-gray-300', { isActive, branch }),
                    isActive === false ? null : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-green-100' : 'bg-red-100'
                    )
                ),
                header: cn(
                    `${baseHeaderClass} bg-gray-300 rounded-tl-lg rounded-tr-lg`,
                    isActive === false ? 'bg-gray-300 text-black' : branch != undefined && (
                        branch === true ? 'bg-emerald-800 text-white' : 'bg-red-800 text-white'
                    )
                ),
            };
        case 'loopBlock':
            return {
                wrapper: cn(
                    baseWrapperClass,
                    getRingClass('ring-2 ring-cyan-200', { isActive, branch })
                ),
                card: cn(
                    `${baseCardClass} bg-cyan-50`,
                    getBorderClass('border-cyan-400', { isActive, branch }),
                    isActive === false ? 'bg-gray-100' : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-green-50' : 'bg-red-50'
                    )
                ),
                header: '',
            };
        case 'codeBlock':
            return {
                wrapper: cn(
                    baseWrapperClass,
                    getRingClass('ring-2 ring-amber-200', { isActive, branch })
                ),
                card: cn(
                    `${baseCardClass} bg-amber-200`,
                    getBorderClass('border-amber-300', { isActive, branch }),

                ),
                header: cn(
                    `${baseHeaderClass} bg-amber-200 rounded-tl-lg rounded-lg`,
                    isActive === false ? 'bg-gray-300 text-black' : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-emerald-800 text-white' : 'bg-red-800 text-white'
                    )
                ),
            };
        default:
            return {
                wrapper: cn(
                    baseWrapperClass,
                    getRingClass('ring-2 ring-gray-200', { isActive, branch })
                ),
                card: cn(
                    baseCardClass,
                    getBorderClass('border-gray-300', { isActive, branch }),
                    isActive === false ? null : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-green-100' : 'bg-red-100'
                    )
                ),
                header: cn(
                    `${baseHeaderClass} bg-gray-300 rounded-tl-lg rounded-tr-lg`,
                    isActive === false ? 'bg-gray-300 text-black' : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-emerald-800 text-white' : 'bg-red-800 text-white'
                    )
                ),
            };
    }
}

function getIterationNodeStyles({ isActive, type }: NodeStyleInput) {
    switch (type) {
        case 'For':
        case 'While':
        case 'DoWhile':
        case 'ForEach':
        default:
            return {
                wrapper: cn(
                    baseWrapperClass,
                    getRingClass('ring-2 ring-cyan-200', { isActive })
                ),
                card: cn(
                    baseCardClass,
                    getBorderClass('border-cyan-400', { isActive })
                ),
                header: cn(
                    `${baseHeaderClass} bg-cyan-300 rounded-lg rounded-tr-lg`,
                    isActive === false && 'bg-gray-300 text-black'
                ),
            };
    }
}

function getControlStructureNodeStyles({ isActive, branch, type }: NodeStyleInput) {
    switch (type) {
        case 'If':
        case 'ElseIf':
        case 'Else':
            return {
                wrapper: cn(
                    baseWrapperClass,
                    getRingClass('ring-2 ring-slate-200', { isActive, branch })
                ),
                card: cn(
                    baseCardClass,
                    getBorderClass('border-black', { isActive, branch }),
                    isActive === false ? null : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-green-100' : 'bg-red-100'
                    )
                ),
                header: cn(
                    `${baseHeaderClass} bg-white rounded-tl-lg rounded-lg`,
                    isActive === false && 'bg-gray-300 text-black'
                ),
            };
        default:
            return {
                wrapper: cn(
                    baseWrapperClass,
                    getRingClass('ring-2 ring-indigo-200', { isActive, branch })
                ),
                card: cn(
                    baseCardClass,
                    getBorderClass('border-indigo-400', { isActive, branch }),
                    isActive === false ? null : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-green-100' : 'bg-red-100'
                    )
                ),
                header: cn(
                    `${baseHeaderClass} bg-indigo-300 rounded-tl-lg rounded-tr-lg`,
                    isActive === false ? 'bg-gray-300 text-black' : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-emerald-800 text-white' : 'bg-red-800 text-white'
                    )
                ),
            };
    }
}

function getMethodNodeStyles({ isActive, branch, type }: NodeStyleInput) {
    switch (type) {
        case 'Constructor':
        case 'Method':
        case 'LocalFunction':
        default:
            return {
                wrapper: cn(
                    baseWrapperClass,
                    getRingClass('ring-2 ring-orange-200', { isActive, branch })
                ),
                card: cn(
                    baseCardClass,
                    getBorderClass('border-orange-300', { isActive, branch }),
                    isActive === false ? null : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-green-100' : 'bg-red-100'
                    )
                ),
                header: cn(
                    `${baseHeaderClass} bg-orange-300 rounded-tl-lg rounded-tr-lg`,
                    isActive === false ? 'bg-gray-300 text-black' : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-emerald-800 text-white' : 'bg-red-800 text-white'
                    )
                ),
            };
    }
}

function getClassNodeStyles({ isActive, branch, type }: NodeStyleInput) {

    switch (type) {
        case 'Namespace':
        case 'Class':
        default:
            return {
                wrapper: cn(
                    baseWrapperClass,
                    getRingClass('ring-2 ring-blue-200', { isActive, branch })
                ),
                card: cn(
                    baseCardClass,
                    getBorderClass('border-blue-300', { isActive, branch }),
                    isActive === false ? null : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-green-100' : 'bg-red-100'
                    )
                ),
                header: cn(
                    `${baseHeaderClass} bg-blue-300 rounded-tl-lg rounded-tr-lg`,
                    isActive === false ? 'bg-gray-300 text-black' : branch != undefined && (
                        branch != undefined && branch === true ? 'bg-emerald-800 text-white' : 'bg-red-800 text-white'
                    )
                ),
            };

    }
}
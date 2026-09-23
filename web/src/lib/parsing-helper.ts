/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseInfo } from "../../types";

// normalize into the TS `BaseInfo` shape
export function parseRoslynData(raw: unknown): BaseInfo[] {
    if (!raw) return [];

    // If extension sent a JSON string, parse it
    let arr: any;
    if (typeof raw === 'string') {
        try {
            arr = JSON.parse(raw);
        } catch {
            return [];
        }
    } else if (Array.isArray(raw)) {
        arr = raw;
    } else if ((raw as any).value) {
        arr = (raw as any).value;
    } else {
        arr = raw as any;
    }

    if (!Array.isArray(arr)) return [];

    const mapItem = (item: any): any => {
        if (!item) return null;

        const mapped: any = {
            type: item.Type ?? item.type,
            startLine: item.StartLine ?? item.startLine ?? item.Start ?? 0,
            endLine: item.EndLine ?? item.endLine ?? item.End ?? 0,
            text: item.Text ?? item.text ?? '',
        };

        // children (recursive)
        const children = item.Children ?? item.children ?? [];
        mapped.children = Array.isArray(children) ? children.map(mapItem).filter(Boolean) : [];

        // optional props
        if (item.Name ?? item.name) mapped.name = item.Name ?? item.name;
        if (item.Modifiers ?? item.modifiers) mapped.modifiers = item.Modifiers ?? item.modifiers;
        if (item.Condition ?? item.condition) mapped.Condition = item.Condition ?? item.condition;
        if (item.Parameters ?? item.parameters) mapped.parameters = Array.isArray(item.Parameters) ? item.Parameters : (item.Parameters ? [item.Parameters] : (item.parameters ?? []));
        if (item.ReturnType ?? item.returnType) mapped.returnType = Array.isArray(item.ReturnType) ? item.ReturnType : (item.ReturnType ? [item.ReturnType] : (item.returnType ?? []));

        return mapped;
    };

    return arr.map(mapItem).filter(Boolean) as BaseInfo[];
}
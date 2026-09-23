import * as vscode from 'vscode';
import type { HighlightLinePayload } from './messages';

let globalEditor: vscode.TextEditor | undefined;
let currentHighlightedRange: HighlightLinePayload | null = null;
let ignoreNextSelectionChange = false;
const lineHighlightDecoration = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: 'rgba(28, 101, 255, 0.1)',
    borderColor: 'transparent',
    borderStyle: 'none',
    borderWidth: '0',
    overviewRulerColor: 'rgba(28, 101, 255, 1)',
    overviewRulerLane: vscode.OverviewRulerLane.Full,
    light: {
        backgroundColor: 'rgba(28, 101, 255, 0.1)',
        borderColor: 'transparent'
    },
    dark: {
        backgroundColor: 'rgba(28, 101, 255, 0.1)',
        borderColor: 'transparent'
    }
});

/**
 * Initializes the editor reference
 */
export function initializeEditor(): void {
    globalEditor = vscode.window.activeTextEditor;
}

/**
 * Updates the tracked source editor when focus changes.
 */
export function updateEditor(editor: vscode.TextEditor | undefined): void {
    if (editor) {
        globalEditor = editor;
    }
}

/**
 * Ensures the editor is initialized
 */
function ensureEditor(): vscode.TextEditor {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor && activeEditor.document.uri.scheme === 'file') {
        globalEditor = activeEditor;
    }

    if (!globalEditor) {
        throw new Error('Editor is not initialized');
    }
    return globalEditor;
}

/**
 * Reads the content of the active document.
 * 
 * @returns 
 */
export function readActiveDocumentContent(): string | undefined {
    const editor = ensureEditor();

    if (editor) {
        return editor.document.getText();
    }
    return undefined;
}

/**
 * Normalizes the highlight range to ensure it's within the document bounds.
 * 
 * @param editor 
 * @param startLine 
 * @param endLine 
 * @returns 
 */
function normalizeHighlightRange(editor: vscode.TextEditor, startLine: number, endLine: number): HighlightLinePayload {
    const lastLineIndex = Math.max(editor.document.lineCount - 1, 0);
    const normalizedStartLine = Math.min(Math.max(startLine, 1), lastLineIndex + 1);
    const normalizedEndLine = Math.min(Math.max(endLine, normalizedStartLine), lastLineIndex + 1);

    return {
        startLine: normalizedStartLine,
        endLine: normalizedEndLine
    };
}

/**
 * Builds a line range based on the provided editor and highlight payload.
 * 
 * @param editor 
 * @param param1 
 * @returns 
 */
function buildLineRange(editor: vscode.TextEditor, { startLine, endLine }: HighlightLinePayload): vscode.Range {
    const startPosition = new vscode.Position(startLine - 1, 0);
    const endPosition = editor.document.lineAt(endLine - 1).range.end;
    return new vscode.Range(startPosition, endPosition);
}

/**
 * Checks if two highlight ranges are equal.
 * 
 * @param left 
 * @param right 
 * @returns 
 */
function rangesAreEqual(left: HighlightLinePayload | null, right: HighlightLinePayload | null): boolean {
    if (!left || !right) {
        return left === right;
    }

    return left.startLine === right.startLine && left.endLine === right.endLine;
}

/**
 * Highlights the requested line range in the tracked editor.
 */
export function highlightLines(startLine: number, endLine: number): HighlightLinePayload {
    const editor = ensureEditor();
    const normalizedRange = normalizeHighlightRange(editor, startLine, endLine);
    const range = buildLineRange(editor, normalizedRange);
    const startPosition = new vscode.Position(normalizedRange.startLine - 1, 0);

    ignoreNextSelectionChange = true;
    currentHighlightedRange = normalizedRange;
    editor.selection = new vscode.Selection(startPosition, startPosition);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    editor.setDecorations(lineHighlightDecoration, [range]);

    return normalizedRange;
}

export function clearHighlightedLines(): void {
    if (!globalEditor) {
        currentHighlightedRange = null;
        return;
    }

    currentHighlightedRange = null;
    globalEditor.setDecorations(lineHighlightDecoration, []);
}

export function syncHighlightToSelection(editor?: vscode.TextEditor): HighlightLinePayload {
    const targetEditor = editor ?? ensureEditor();
    const activeLine = targetEditor.selection.active.line + 1;
    const normalizedRange = normalizeHighlightRange(targetEditor, activeLine, activeLine);

    currentHighlightedRange = normalizedRange;
    targetEditor.setDecorations(lineHighlightDecoration, [buildLineRange(targetEditor, normalizedRange)]);

    return normalizedRange;
}

export function toggleHighlightedLines(startLine: number, endLine: number): HighlightLinePayload | null {
    const editor = ensureEditor();
    const normalizedRange = normalizeHighlightRange(editor, startLine, endLine);

    if (rangesAreEqual(currentHighlightedRange, normalizedRange)) {
        clearHighlightedLines();
        return null;
    }

    return highlightLines(normalizedRange.startLine, normalizedRange.endLine);
}

export function consumePendingSelectionChangeIgnore(): boolean {
    if (!ignoreNextSelectionChange) {
        return false;
    }

    ignoreNextSelectionChange = false;
    return true;
}

export function getHighlightedRange(): HighlightLinePayload | null {
    return currentHighlightedRange;
}


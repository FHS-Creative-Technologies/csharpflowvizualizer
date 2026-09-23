export type HighlightLinePayload = {
    startLine: number;
    endLine: number;
};

export type WebviewToExtensionMessage =
    | { command: 'getFileContent' }
    | { command: 'highlightLine'; data: HighlightLinePayload };

export type ExtensionToWebviewMessage =
    | { command: 'roslynAnalysis'; data: unknown }
    | { command: 'lineSelectionChanged'; data: number | null }
    | { command: 'highlightedLinesChanged'; data: HighlightLinePayload | null }
    | { command: 'analysisError'; text: string };
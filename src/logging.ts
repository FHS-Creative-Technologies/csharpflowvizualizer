import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('C# Flow Visualizer');
    }

    return outputChannel;
}

export function logInfo(message: string): void {
    getOutputChannel().appendLine(`[info] ${message}`);
}

export function logError(message: string): void {
    getOutputChannel().appendLine(`[error] ${message}`);
}

export function showOutputChannel(preserveFocus = true): void {
    getOutputChannel().show(preserveFocus);
}
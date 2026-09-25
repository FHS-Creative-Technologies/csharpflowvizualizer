import * as vscode from 'vscode';
import { randomBytes } from 'crypto';
import { initializeEditor, readActiveDocumentContent, toggleHighlightedLines } from './editor';
import { analyzeCode } from './analyzer';
import type { ExtensionToWebviewMessage, WebviewToExtensionMessage } from './messages';
import { logError, logInfo, showOutputChannel } from './logging';

let globalPanel: vscode.WebviewPanel | undefined;

/**
 * Generates a random nonce for Content Security Policy
 * 
 * @returns 
 */
function getNonce(): string {
    return randomBytes(16).toString('base64');
}

/**
 * Builds the Content Security Policy for the webview
 * 
 * @param webview 
 * @param nonce 
 * @returns 
 */
function buildContentSecurityPolicy(webview: vscode.Webview, nonce: string): string {
    return [
        "default-src 'none'",
        `img-src ${webview.cspSource} https: data:`,
        `style-src ${webview.cspSource} 'unsafe-inline'`,
        `font-src ${webview.cspSource}`,
        `connect-src ${webview.cspSource}`,
        `script-src 'nonce-${nonce}'`
    ].join('; ');
}

/**
 * Analyzes the active document and sends the results to the webview
 */
async function analyzeAndSendActiveDocument(): Promise<void> {
    const content: string = readActiveDocumentContent() || '';
    logInfo(`Starting analysis for active document with ${content.length} characters.`);

    try {
        const analysis = await analyzeCode(content);
        handleSendMessage({
            command: 'roslynAnalysis',
            data: analysis
        });
    } catch (error) {
        const messageText = error instanceof Error ? error.message : String(error);
        logError(messageText);
        showOutputChannel();
        handleSendMessage({
            command: 'analysisError',
            text: messageText
        });
        vscode.window.showErrorMessage(`Roslyn analysis failed: ${messageText}`);
    }
}

/**
 * Refreshes the visualization in the webview
 * @returns 
 */
export async function refreshVisualization(): Promise<void> {
    if (!globalPanel) {
        return;
    }

    await analyzeAndSendActiveDocument();
}

/**
 * Opens the C# Flow Visualizer webview panel
 */
export async function openWebviewPanel(context: vscode.ExtensionContext): Promise<void> {
    initializeEditor();

    if (globalPanel) {
        globalPanel.reveal(vscode.ViewColumn.Two);
        await refreshVisualization();
        return;
    }

    // Create webview panel
    globalPanel = vscode.window.createWebviewPanel(
        'csharpFlowVisualizer',
        'C# Flow Visualizer',
        vscode.ViewColumn.Two,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'web', 'dist')]
        }
    );

    logInfo('Opened C# Flow Visualizer webview panel.');

    globalPanel.onDidDispose(() => {
        logInfo('C# Flow Visualizer webview panel disposed.');
        globalPanel = undefined;
    });

    const panel = ensurePanel();

    // Load and prepare HTML content
    const htmlContent = await loadWebviewContent(context);
    panel.webview.html = htmlContent;

    // Setup message handlers
    setupWebviewMessageHandlers();
}

/**
 * Ensures the webview panel is initialized
 */
function ensurePanel(): vscode.WebviewPanel {
    if (!globalPanel) {
        throw new Error('Webview panel is not initialized');
    }
    return globalPanel;
}

/**
 * Loads the webview HTML content with correct asset URIs
 */
async function loadWebviewContent(
    context: vscode.ExtensionContext,
): Promise<string> {

    const panel = ensurePanel();
    const nonce = getNonce();
    const csp = buildContentSecurityPolicy(panel.webview, nonce);

    const distPath = vscode.Uri.joinPath(context.extensionUri, 'web', 'dist');
    const assetsPath = vscode.Uri.joinPath(distPath, 'assets');
    const assetsUri = panel.webview.asWebviewUri(assetsPath);
    const indexHtmlPath = vscode.Uri.joinPath(distPath, 'index.html');

    // Read the built index.html
    const fs = await import('fs');
    let htmlContent = fs.readFileSync(indexHtmlPath.fsPath, 'utf-8');

    // Replace asset paths to work with webview URIs
    htmlContent = htmlContent
        .replace(/<link rel="icon"[^>]*>/g, '')
        .replace(/<head>/, `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}">`)
        .replace(/href="\/assets\//g, `href="${assetsUri}/`)
        .replace(/src="\/assets\//g, `src="${assetsUri}/`)
        .replace(/<script\b/g, `<script nonce="${nonce}"`);

    return htmlContent;
}

/**
 * Sets up message handlers for webview communication
 */
function setupWebviewMessageHandlers(): void {
    const panel = ensurePanel();

    panel.webview.onDidReceiveMessage(async (message: WebviewToExtensionMessage) => {

        switch (message.command) {
            case 'getFileContent':
                await analyzeAndSendActiveDocument();
                break;
            case 'highlightLine':
                const { startLine, endLine } = message.data;
                const highlightedRange = toggleHighlightedLines(startLine, endLine);

                handleSendMessage({
                    command: 'highlightedLinesChanged',
                    data: highlightedRange
                });

                handleSendMessage({
                    command: 'lineSelectionChanged',
                    data: highlightedRange?.startLine ?? null
                });
                break;
        }
    });
}

export function hasOpenPanel(): boolean {
    return globalPanel !== undefined;
}

/**
 * Handles the sending messages to the webview
 */
export function handleSendMessage(
    message: ExtensionToWebviewMessage
): void {
    if (!globalPanel) {
        return;
    }

    const panel = ensurePanel();

    panel.webview.postMessage(message);
}

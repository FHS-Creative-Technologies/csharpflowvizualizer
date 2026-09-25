# Webview Frontend

This package contains the React-based UI for the C# Flow Visualizer VS Code extension. It is bundled with Vite and loaded into a VS Code webview after the extension rewrites the built asset URLs to webview-safe resource paths.

## Responsibilities

- Receive Roslyn analysis results from the extension host.
- Convert analyzer JSON into graph nodes and edges.
- Render the structural graph with React Flow.
- Send user interactions back to the extension, such as manual refresh requests and node-based line highlighting.
- Display lightweight status information like active line, highlighted range, and analysis state.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui primitives
- Zustand for client-side state
- React Flow for the graph canvas

## Important Files

- `src/App.tsx`: main layout and extension interaction entry point.
- `src/store/useRoslynStore.ts`: VS Code message bridge and client state.
- `src/components/chart.tsx`: graph rendering and active-node resolution.
- `src/lib/parsing-helper.ts`: transforms analyzer output into frontend data.
- `src/lib/chart-helper.ts`: converts parsed structures into React Flow nodes and edges.

## Message Flow

The webview communicates with the extension through `postMessage`.

Messages sent to the extension:

- `getFileContent`: request a fresh analysis of the active file.
- `highlightLine`: highlight a line range in the editor.

Messages received from the extension:

- `roslynAnalysis`: analyzer JSON payload.
- `lineSelectionChanged`: active editor line changed.
- `highlightedLinesChanged`: current highlight range changed.
- `analysisError`: analysis failed and the UI should display the error.

## Development

Install dependencies:

```bash
npm install
```

Start local Vite development:

```bash
npm run dev
```

Build the production bundle consumed by the VS Code extension:

```bash
npm run build
```

Lint the frontend package:

```bash
npm run lint
```

Preview the built bundle outside VS Code:

```bash
npm run preview
```

## Integration Notes

- The extension expects built assets in `web/dist`.
- The final `index.html` is not served directly. The extension injects a Content Security Policy and rewrites `/assets/...` URLs before loading it into the webview.
- The webview does not access the filesystem directly. All source data comes from extension messages.
- UI state is driven by the extension host, so the frontend should stay resilient to partial or delayed data.

## Behavior Notes

- Active graph focus is derived from the smallest node range containing the current line or highlight range.
- Clicking a graph node toggles highlight state in the editor.
- Graph layout and node styling are specialized for structural C# constructs such as classes, methods, branches, loops, and generic code blocks.

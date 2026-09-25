# C# Flow Visualizer

C# Flow Visualizer is a Visual Studio Code extension that turns the currently open C# file into an interactive structure graph. It is designed to help you inspect code organization, follow control flow at a high level, and move quickly between the graph and the editor.

## Features

- Visualizes the active C# file as a graph.
- Shows structural elements such as namespaces, classes, methods, loops, if/else chains, and grouped code blocks.
- Keeps the visualization synchronized with the current editor selection.
- Lets you click graph nodes to reveal and highlight the related code in the editor.
- Refreshes automatically when the active C# file is saved.

## Requirements

Before using the extension, make sure the following are available:

- Visual Studio Code `1.108.1` or newer.
- A `.cs` file open in the active editor.
- `.NET 9` (or newer) runtime or SDK available on your `PATH`, because the extension launches a Roslyn-based analyzer through `dotnet`.

## Usage

1. Open a C# source file in VS Code.
2. Open the Command Palette.
3. Run `C# Flow Visualizer: Open Visualizer`.
4. Inspect the generated graph in the webview panel.
5. Click a node to jump to the corresponding code, or move the cursor in the editor to update the highlighted element.

## What The Extension Visualizes

The visualization is based on the syntax structure of the active file. Depending on the file content, the graph can include:

- Namespaces
- Classes
- Methods
- Loops
- Conditional branches
- Aggregated code blocks for unsupported or less specific syntax regions

## How It Works

The extension reads the active C# document, sends its content to a Roslyn-based analyzer, and renders the returned structure inside a webview. The graph and editor remain connected so navigation works in both directions.

## Known Limitations

- Analysis is currently file-based and does not use the full project semantic model.
- Some syntax is intentionally grouped into generic code blocks instead of dedicated node types.
- The extension is focused on structural comprehension, not full semantic analysis or debugging.

## Development

If you want to build or modify the extension locally:

```bash
npm install
npm run build:web
npm run build:analyzer
npm run compile
```

For local extension development in VS Code:

1. Run `npm run watch` in the extension root if you want continuous TypeScript builds.
2. Press `F5` to open an Extension Development Host.
3. Open a `.cs` file and run the extension command.

## Packaging

### Prerequisites

- Node.js 24 (see `mise.toml`)
- .NET 9 SDK or newer, used to publish the Roslyn analyzer

### From a fresh clone to a VSIX package

```bash
git clone https://github.com/FHS-Creative-Technologies/csharpvizualizer.git
cd csharpvizualizer
npm install
npx @vscode/vsce package
```
The result is `csharp-flow-visualizer-<version>.vsix` in the repository root. To try it out locally:

```bash
code --install-extension csharp-flow-visualizer-<version>.vsix
```

## Project Structure

- `src`: VS Code extension source
- `web`: React webview application
- `roslynAnalyzer`: Roslyn-based C# analyzer
- `analyzer-dist`: published analyzer output included in packaged builds
- `playground`: sample files for manual testing

## License

This project is licensed under the MIT License.

## Attribution

Thanks to [Christine Bell](https://github.com/chrtbe) for the huge effort in developing this
VS Code extension.

Further development will taken place under FH Salzburg, Department Creative Technologies.

# Roslyn Analyzer

This project contains the .NET console application used by the VS Code extension to analyze C# source code. It reads source text from standard input, parses it with Roslyn, walks the syntax tree, and writes a JSON representation of the discovered structure to standard output.

## Purpose

The analyzer is intentionally separated from the VS Code extension host. Roslyn runs in the external .NET process, while the extension communicates with it through standard input and standard output.

## Runtime Contract

Input:

- Raw C# source code from stdin.

Output:

- JSON array printed to stdout.

## Extracted Structures

The current visitor extracts and serializes these structural elements:

- namespaces
- classes
- constructors
- methods
- local functions
- if / else if / else chains
- `for`, `foreach`, `while`, and `do while` loops
- collapsed code blocks for unhandled syntax regions

When a subtree contains no control structures, it is often summarized into a single `CodeBlockInfo` node instead of preserving every nested syntax node.

## Key Files

- `Program.cs`: reads stdin, parses the syntax tree, and runs the visitor.
- `VisitNodes.cs`: traverses Roslyn syntax nodes and builds the output model.
- `HelperClass.cs`: helper logic for constructing model objects and detecting control structures.
- `BaseInfo*.cs`, `ClassBaseInfo.cs`, `MethodInfo.cs`, `ControlStructureInfo.cs`, `CodeBlockInfo.cs`: serialized model types.

## Requirements

- .NET SDK 9.0

## Run Locally

Run the analyzer directly from this folder:

```bash
dotnet run --project .\roslynAnalyzer.csproj < ..\playground\hello\Program.cs
```

Build the analyzer:

```bash
dotnet build
```

Publish the analyzer:

```bash
dotnet publish -c Release -o ..\analyzer-dist
```

## Integration With The Extension

- During development, the extension can fall back to `dotnet run --project roslynAnalyzer` if a published analyzer assembly is not present.
- For packaged builds, the extension prefers the published analyzer located in `analyzer-dist`.
- The extension expects valid JSON on stdout. Any stderr output or non-zero exit code is treated as an analysis failure.

## Current Limitations

- The analyzer currently uses syntax-tree analysis only and does not build a full semantic model.
- Some syntax kinds are grouped into generic code blocks instead of dedicated node types.

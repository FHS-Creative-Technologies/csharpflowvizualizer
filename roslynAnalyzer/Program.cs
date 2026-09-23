using System;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

// Read code from stdin
string code = Console.In.ReadToEnd();

var tree = CSharpSyntaxTree.ParseText(code);
var root = tree.GetRoot();

var visitor = new VisitNodes(root);
visitor.Execute();

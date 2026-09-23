using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Unicode;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

public class VisitNodes
{
    private SyntaxNode root;

    public VisitNodes(SyntaxNode root)
    {
        this.root = root;
    }

    public void Execute()
    {
        var controlStructures = ExtractControlStructures(root).ToList();

        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            Encoder = JavaScriptEncoder.Create(UnicodeRanges.All), // avoid \u0022
        };
        // Ensure polymorphic serialization of BaseInfo references
        options.Converters.Add(new BaseInfoJsonConverter());

        string json = JsonSerializer.Serialize(controlStructures, options);
        Console.WriteLine(json);
    }

    List<BaseInfo> ExtractControlStructures(SyntaxNode root)
    {
        var roots = new List<BaseInfo>();
        ExtractRecursive(root, roots);
        return roots;
    }

    void ExtractRecursive(SyntaxNode node, List<BaseInfo> parentList)
    {
        foreach (var child in node.ChildNodes())
        {
            switch (child)
            {
                case UsingDirectiveSyntax usingStmt:
                    // ignore using
                    break;
                case NamespaceDeclarationSyntax namespaceDecl:
                    AttachAndRecurse(
                        new BlockBaseInfo("Namespace", namespaceDecl),
                        namespaceDecl,
                        parentList
                    );
                    break;
                case ClassDeclarationSyntax classDecl:
                    AttachAndRecurse(HelperClass.BuildClassInfo(classDecl), classDecl, parentList);
                    break;
                case ConstructorDeclarationSyntax ctorDecl:
                    var ctorInfo = HelperClass.BuildMethodInfoFromConstructor(ctorDecl);
                    AttachAndRecurse(
                        ctorInfo,
                        ctorDecl.Body ?? (SyntaxNode)ctorDecl.ExpressionBody!,
                        parentList
                    );
                    break;
                case MethodDeclarationSyntax methodDecl:
                    var methodInfo = HelperClass.BuildMethodInfoFromMethod(methodDecl);
                    AttachAndRecurse(
                        methodInfo,
                        methodDecl.Body ?? (SyntaxNode)methodDecl.ExpressionBody!,
                        parentList
                    );
                    break;
                case LocalFunctionStatementSyntax localFunc:
                    var localFuncInfo = HelperClass.BuildMethodInfoFromLocalFunction(localFunc);
                    AttachAndRecurse(
                        localFuncInfo,
                        localFunc.Body ?? (SyntaxNode)localFunc.ExpressionBody!,
                        parentList
                    );
                    break;
                case IfStatementSyntax ifStmt:
                    ExtractIfChain(ifStmt, parentList);
                    break;
                case ForStatementSyntax forStmt:
                    CreateAndAttachControlStructure(
                        "For",
                        forStmt.Condition?.ToString() ?? "",
                        forStmt.Statement,
                        parentList
                    );
                    break;
                case WhileStatementSyntax whileStmt:
                    CreateAndAttachControlStructure(
                        "While",
                        whileStmt.Condition.ToString(),
                        whileStmt.Statement,
                        parentList
                    );
                    break;
                case DoStatementSyntax doStmt:
                    CreateAndAttachControlStructure(
                        "DoWhile",
                        doStmt.Condition.ToString(),
                        doStmt.Statement,
                        parentList
                    );
                    break;
                case ForEachStatementSyntax forEachStmt:
                    CreateAndAttachControlStructure(
                        "ForEach",
                        forEachStmt.Expression.ToString(),
                        forEachStmt.Statement,
                        parentList
                    );
                    break;
                case ForEachVariableStatementSyntax forEachVarStmt:
                    // include the left-side variable designation for clarity
                    var condition =
                        forEachVarStmt.Variable?.ToString()
                        + " in "
                        + forEachVarStmt.Expression?.ToString();

                    CreateAndAttachControlStructure(
                        "ForEach",
                        condition ?? "",
                        forEachVarStmt.Statement,
                        parentList
                    );
                    break;

                default:
                    // Summarize any unhandled node as a single CodeBlock.
                    // If the subtree contains only other code blocks (no control structures) collapse the entire subtree into this single top CodeBlock and do not recurse.
                    if (!HelperClass.SubtreeContainsControlStructures(child))
                    {
                        if (parentList.Count > 0)
                        {
                            var previousNode = parentList.Last();
                            if (
                                previousNode != null
                                && previousNode is CodeBlockInfo previousCodeBlock
                            )
                            {
                                // If the previous node is already a CodeBlock, we can just extend its span to include this new block, instead of creating a new sibling CodeBlock.
                                previousCodeBlock.ExtendSpanToInclude(child);
                            }
                            else
                            {
                                parentList.Add(new CodeBlockInfo(child));
                            }
                        }
                        else
                        {
                            // if there is no previous node, just add the new CodeBlock
                            parentList.Add(new CodeBlockInfo(child));
                        }
                    }
                    else
                    {
                        // parentList.Add(new CodeBlockInfo(child));
                        ExtractRecursive(child, parentList);
                    }
                    break;
            }
        }
    }

    void CreateAndAttachControlStructure(
        string kind,
        string condition,
        SyntaxNode? statement,
        List<BaseInfo> parentList
    )
    {
        var info = new ControlStructureInfo(kind, condition, statement);
        AttachAndRecurse(info, statement, parentList);
    }

    void AttachAndRecurse(BlockBaseInfo info, SyntaxNode? bodyNode, List<BaseInfo> parentList)
    {
        parentList.Add(info);

        if (bodyNode != null)
        {
            // If the body subtree contains no control structures, collapse it into a single CodeBlock instead of enumerating its children
            if (!HelperClass.SubtreeContainsControlStructures(bodyNode))
            {
                info.Children.Add(new CodeBlockInfo(bodyNode));
            }
            else
            {
                ExtractRecursive(bodyNode, info.Children);
            }
        }
    }

    void ExtractIfChain(IfStatementSyntax ifStmt, List<BaseInfo> parentList)
    {
        // ---- IF ----
        var ifInfo = new ControlStructureInfo("If", ifStmt.Condition.ToString(), ifStmt.Statement);
        AttachAndRecurse(ifInfo, ifStmt.Statement, parentList);

        // ---- ELSE IF / ELSE ----
        var currentElse = ifStmt.Else;

        while (currentElse != null)
        {
            if (currentElse.Statement is IfStatementSyntax elseIf)
            {
                var elseIfInfo = new ControlStructureInfo(
                    "ElseIf",
                    elseIf.Condition.ToString(),
                    elseIf.Statement
                );
                AttachAndRecurse(elseIfInfo, elseIf.Statement, parentList);

                currentElse = elseIf.Else;
            }
            else
            {
                var elseInfo = new ControlStructureInfo("Else", "", currentElse.Statement);
                AttachAndRecurse(elseInfo, currentElse.Statement, parentList);

                break;
            }
        }
    }
}

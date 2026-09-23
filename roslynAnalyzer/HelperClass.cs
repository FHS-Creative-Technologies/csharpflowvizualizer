using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

public static class HelperClass
{
    public static ClassBaseInfo BuildClassInfo(ClassDeclarationSyntax classDecl)
    {
        return new ClassBaseInfo(
            "Class",
            classDecl.Modifiers.ToString(),
            classDecl.Identifier.Text,
            classDecl
        );
    }

    public static MethodInfo BuildMethodInfoFromConstructor(ConstructorDeclarationSyntax ctorDecl)
    {
        return new MethodInfo(
            "Constructor",
            null,
            ctorDecl.ParameterList.Parameters.Select(p => p.ToString()).ToList(),
            ctorDecl.Modifiers.ToString(),
            ctorDecl.Identifier.Text,
            ctorDecl.Body ?? (SyntaxNode)ctorDecl.ExpressionBody!
        );
    }

    public static MethodInfo BuildMethodInfoFromMethod(MethodDeclarationSyntax methodDecl)
    {
        return new MethodInfo(
            "Method",
            methodDecl.ReturnType.ToString(),
            methodDecl.ParameterList.Parameters.Select(p => p.ToString()).ToList(),
            methodDecl.Modifiers.ToString(),
            methodDecl.Identifier.Text,
            methodDecl.Body ?? (SyntaxNode)methodDecl.ExpressionBody!
        );
    }

    public static MethodInfo BuildMethodInfoFromLocalFunction(
        LocalFunctionStatementSyntax localFunc
    )
    {
        return new MethodInfo(
            "LocalFunction",
            localFunc.ReturnType.ToString(),
            localFunc.ParameterList.Parameters.Select(p => p.ToString()).ToList(),
            localFunc.Modifiers.ToString(),
            localFunc.Identifier.Text,
            localFunc.Body ?? (SyntaxNode)localFunc.ExpressionBody!
        );
    }

    public static bool SubtreeContainsControlStructures(SyntaxNode node)
    {
        foreach (var n in node.DescendantNodesAndSelf())
        {
            switch (n)
            {
                case ClassDeclarationSyntax:
                case ConstructorDeclarationSyntax:
                case MethodDeclarationSyntax:
                case LocalFunctionStatementSyntax:
                case IfStatementSyntax:
                case ForStatementSyntax:
                case WhileStatementSyntax:
                case DoStatementSyntax:
                case ForEachStatementSyntax:
                case ForEachVariableStatementSyntax:
                    return true;
            }
        }

        return false;
    }
}

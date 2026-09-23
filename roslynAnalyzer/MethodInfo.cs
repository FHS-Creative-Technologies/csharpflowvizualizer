using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

public class MethodInfo : ClassBaseInfo
{
    public string ReturnType { get; set; } = "";
    public List<string> Parameters { get; set; } = new();

    public MethodInfo(
        string type,
        string returnType,
        List<string> parameters,
        string modifiers,
        string name,
        SyntaxNode? bodyNode,
        List<BaseInfo>? children = null
    )
        : base(type, modifiers, name, bodyNode, children)
    {
        ReturnType = returnType;
        Parameters = parameters;
    }
}

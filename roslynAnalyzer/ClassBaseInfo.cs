using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

public class ClassBaseInfo : BlockBaseInfo
{
    public string Modifiers { get; set; } = "";
    public string Name { get; set; } = "";

    public ClassBaseInfo(
        string type,
        string modifiers,
        string name,
        SyntaxNode? bodyNode,
        List<BaseInfo>? children = null
    )
        : base(type, bodyNode, children)
    {
        Type = type;
        Modifiers = modifiers;
        Name = name;
    }
}

using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

public class ControlStructureInfo : BlockBaseInfo
{
    public string Condition { get; set; } = "";

    public ControlStructureInfo(
        string type,
        string condition,
        SyntaxNode? bodyNode,
        List<BaseInfo>? children = null
    )
        : base(type, bodyNode, children)
    {
        Condition = condition;
    }
}

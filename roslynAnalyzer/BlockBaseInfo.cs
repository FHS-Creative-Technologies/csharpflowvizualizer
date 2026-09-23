using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

public class BlockBaseInfo : BaseInfo
{
    public List<BaseInfo> Children { get; set; } = new();

    public BlockBaseInfo(string type, SyntaxNode? bodyNode, List<BaseInfo>? children = null)
        : base(type, bodyNode)
    {
        Type = type;
        Children = children ?? new List<BaseInfo>();
    }
}

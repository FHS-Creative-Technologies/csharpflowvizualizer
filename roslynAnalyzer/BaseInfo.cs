using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

public abstract class BaseInfo
{
    public string Type { get; set; } = "";

    public int StartLine { get; set; }
    public int EndLine { get; set; }

    public string Text { get; set; } = "";

    public BaseInfo(string type, SyntaxNode? bodyNode)
    {
        var span = bodyNode.GetLocation().GetLineSpan();

        Type = type;
        StartLine = span.StartLinePosition.Line + 1;
        EndLine = span.EndLinePosition.Line + 1;
        Text = bodyNode.ToString();
    }
}

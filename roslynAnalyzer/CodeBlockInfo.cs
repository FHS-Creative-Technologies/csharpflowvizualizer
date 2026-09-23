using Microsoft.CodeAnalysis;

public class CodeBlockInfo : BaseInfo
{
    public CodeBlockInfo(SyntaxNode? bodyNode)
        : base("CodeBlock", bodyNode)
    {
        Type = "CodeBlock";
    }

    public void ExtendSpanToInclude(SyntaxNode newNode)
    {
        var currentStart = this.StartLine;
        var currentEnd = this.EndLine;
        var currentText = this.Text;

        var newSpan = newNode.GetLocation().GetLineSpan();
        var newStart = newSpan.StartLinePosition.Line + 1;
        var newEnd = newSpan.EndLinePosition.Line + 1;
        var newText = newNode.ToString();

        var finalStart = (newStart < currentStart) ? newStart : currentStart;
        var finalEnd = (newEnd > currentEnd) ? newEnd : currentEnd;

        this.StartLine = finalStart;
        this.EndLine = finalEnd;

        var gap = new string('\n', newStart - currentEnd);

        this.Text = currentText + gap + newText;
    }
}

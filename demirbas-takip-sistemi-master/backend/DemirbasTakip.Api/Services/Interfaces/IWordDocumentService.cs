namespace DemirbasTakip.Api.Services.Interfaces;

public interface IWordDocumentService
{
    Task<byte[]> GenerateAssignmentProtocolAsync(int assignmentId);
    Task<byte[]> GenerateReturnProtocolAsync(int assignmentId);
}

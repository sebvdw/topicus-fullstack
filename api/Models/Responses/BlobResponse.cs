using System.Reflection.Metadata;
using api.Models.Entities;

namespace api.Models.Responses;

public class BlobResponse
{
    public BlobResponse()
    {
        Blob = new BlobAsset();
    }
    
    public string? Status { get; set; }
    public bool Error { get; set; }
    public BlobAsset Blob { get; set; }
}
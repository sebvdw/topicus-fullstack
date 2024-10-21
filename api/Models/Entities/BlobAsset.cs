namespace api.Models.Entities;

public class BlobAsset
{
    public string? Uri { get; set; }
    public string? Name { get; set; }
    public string? ContentType { get; set; }
    public string? Content { get; set; }
}
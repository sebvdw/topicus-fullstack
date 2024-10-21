using System.Text.Json.Serialization;

namespace api.Models.Entities;

public class BlobContainer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int MunicipalityId { get; set; }
}
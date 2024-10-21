using System.Text.Json.Serialization;

namespace api.Models.Entities;

public class Translation
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Body { get; set; }
    public string PrivacyStatement { get; set; }
    public int MunicipalityId { get; set; }
}
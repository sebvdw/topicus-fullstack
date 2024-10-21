using System.Text.Json.Serialization;

namespace api.Models.Entities;

public class Theme
{
    public int Id { get; set; }
    public string PrimaryColor { get; set; }
    public string SecondaryColor { get; set; }
    public bool IsDefault { get; set; }
    public int MunicipalityId { get; set; }
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? FontId { get; set; }
        
    public Font? Font { get; set; }
    public int isPDF { get; set; }
}
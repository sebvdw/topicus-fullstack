using System.Reflection.Metadata;
using api.Models.Entities;
using api.Models.Responses;
using Azure;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace api;

public class FileService
{
    private readonly string _storageAccount = "topicus";
    private readonly string _key = "";
    private BlobContainerClient _filesContainer;
    private readonly ILogger _logger;
    private BlobServiceClient _blobServiceClient;
    private string _containerName = "blobstorage";

    public FileService(ILogger<FileService> logger)
    {
        _logger = logger;
        var credential = new StorageSharedKeyCredential(_storageAccount, _key);
        var blobUri = new Uri($"https://{_storageAccount}.blob.core.windows.net");
        _blobServiceClient = new BlobServiceClient(blobUri, credential);
        _filesContainer = _blobServiceClient.GetBlobContainerClient("blobstorage");
    }

    private async Task<string> GetFileBase64(BlobClient file)
    {
        var data = await file.OpenReadAsync();
        Stream blobContent = data;

        byte[] bytes;
        using (var memoryStream = new MemoryStream())
        {
            blobContent.CopyTo(memoryStream);
            bytes = memoryStream.ToArray();
        }
        return Convert.ToBase64String(bytes);
    }
    private string GetFileTypeBase64(string fileName)
    {
        string extension = fileName.Split('.')[1];
        switch (extension)
        {
            case "png":
                return "image/png";
            case "jpg":
                return "image/jpg";
            case "jpeg":
                return "image/jpeg";
            case "svg":
                return "image/svg+xml";
            default:
                return "image/png";
        }
    }
    public async Task FindAndReplaceBlobWithAssetTag(string tagName, string type = "Image")
    {
        string query = $@"""Asset"" = '{tagName}' AND ""Type"" = '{type}'";

        // Find Blobs given a tags query
        _logger.LogInformation("Find Blob by Tags query: " + query + Environment.NewLine);

        List<TaggedBlobItem> blobs = new List<TaggedBlobItem>();
        await foreach (TaggedBlobItem taggedBlobItem in _blobServiceClient.FindBlobsByTagsAsync(query))
        {
            blobs.Add(taggedBlobItem);
        }

        foreach (var filteredBlob in blobs)
        {

            _logger.LogInformation($"BlobIndex result: ContainerName= {filteredBlob.BlobContainerName}, " +
                              $"BlobName= {filteredBlob.BlobName}");
            DeleteAsync(filteredBlob.BlobName);
        }

    }
    public void ChangeContainer(string containerName)
    {
        _containerName = containerName.ToLower();
        //if blob container does not exist, create it
         if (!_blobServiceClient.GetBlobContainerClient(_containerName).Exists())
         {
             _blobServiceClient.CreateBlobContainer(_containerName);
         }
        _filesContainer = _blobServiceClient.GetBlobContainerClient(_containerName);
    }
    // upload a file, tag should be either Image, CSS or JSON
    public async Task<BlobResponse> PutFileAsync(IFormFile blob, string Type = "Image")
    {
        // if file already exists, in Asset tag, delete it. Asset tags should be unique for the file.
        await FindAndReplaceBlobWithAssetTag(blob.FileName.Split(".")[0], Type);

        // upload the file with correct meta data.
        BlobResponse response = new BlobResponse();
        BlobClient client = _filesContainer.GetBlobClient(blob.FileName);
        BlobUploadOptions options = new BlobUploadOptions();
        // type tag should always be one of three: Image, CSS or JSON
        options.Tags = new Dictionary<string, string>
        {
            { "Asset", blob.FileName.Split(".")[0]},
            { "Type", Type}
        };

        await using (Stream? data = blob.OpenReadStream())
        {
            await client.UploadAsync(data, options);
        }

        response.Status = $"File uploaded successfully: {blob.FileName}";
        response.Error = false;
        response.Blob.Uri = client.Uri.AbsoluteUri;
        response.Blob.Name = client.Name.Split('.')[0];

        return response;
    }
    // returns a file with base64 without prefix, tag should be either CSS or JSON
    public async Task<BlobAsset?> GetFileAsync(string fileName, string Type)
    {
        string query = $@"@container = '{_containerName}' AND ""Type"" = '{Type}' AND ""Asset"" = '{fileName.Split(".")[0]}'";
        TaggedBlobItem blob = null;
        await foreach (TaggedBlobItem taggedBlobItem in _blobServiceClient.FindBlobsByTagsAsync(query))
        {
            blob = taggedBlobItem;
            break;
        }

        if (blob == null) return null;

        BlobClient file = _filesContainer.GetBlobClient(blob.BlobName);
        if (await file.ExistsAsync())
        {
            var content = await file.DownloadContentAsync();
            string name = fileName;
            string contentType = content.Value.Details.ContentType;
            return new BlobAsset()
            {
                Content =  GetFileBase64(file).Result, Name = name, ContentType = contentType
            };
        }
        return null;
    }
    // delete a file.
    public async Task<BlobResponse> DeleteAsync(string fileName)
    {
        BlobClient file = _filesContainer.GetBlobClient(fileName);

        await file.DeleteAsync();

        return new BlobResponse { Error = false, Status = $"File: {fileName} has been successfully deleted."};
    }
    // returns a list of files within the container, does contain the base64 content
    public async Task<List<BlobAsset>> ListFilesAsync()
    {
        var blobs = new List<BlobAsset>();
        await foreach (var blobItem in _filesContainer.GetBlobsAsync())
        {
            var blobClient = _filesContainer.GetBlobClient(blobItem.Name);
            blobs.Add(new BlobAsset
            {
                Uri = blobClient.Uri.ToString(),
                Name = blobClient.Name,
                ContentType = blobItem.Properties.ContentType
            });
        }
        return blobs;
    }
    // returns a list of files with base64 prefix, tag should always be Image
    public async Task<List<BlobAsset>> ListImagesAsync()
    {
        string query = $@"@container = '{_containerName}' AND ""Type"" = 'Image'";
        var blobsToDownload = new List<BlobAsset>();
        List<TaggedBlobItem> blobs = new List<TaggedBlobItem>();
        await foreach (TaggedBlobItem taggedBlobItem in _blobServiceClient.FindBlobsByTagsAsync(query))
        {
            blobs.Add(taggedBlobItem);
        }

        foreach (var filteredBlob in blobs)
        {
            var file = _filesContainer.GetBlobClient(filteredBlob.BlobName);
            var content = $"data:{GetFileTypeBase64(file.Name)};base64," + GetFileBase64(file).Result;
            blobsToDownload.Add(new BlobAsset
            {
                Uri = file.Uri.ToString(),
                Name = file.Name,
                Content = content
            });
        }

        return blobsToDownload;
    }
    // returns a file with base64 prefix, tag should always be Image
    public async Task<BlobAsset?> GetImageAsync(string fileName, string Type = "Image")
    {
        string query = $@"@container = '{_containerName}' AND ""Type"" = '{Type}' AND ""Asset"" = '{fileName}'";
        TaggedBlobItem blob = null;
        await foreach (TaggedBlobItem taggedBlobItem in _blobServiceClient.FindBlobsByTagsAsync(query))
        {
            blob = taggedBlobItem;
            break;
        }

        if (blob == null) return null;

        BlobClient file = _filesContainer.GetBlobClient(blob.BlobName);
        if (await file.ExistsAsync())
        {
            var content = await file.DownloadContentAsync();
            string name = fileName;
            string contentType = content.Value.Details.ContentType;
            return new BlobAsset()
            {
                Content =  $"data:{GetFileTypeBase64(file.Name)};base64," + GetFileBase64(file).Result,
                Name = name,
                ContentType = contentType
            };
        }
        return null;
    }


}

namespace DemirbasTakip.Api.Services.Interfaces;

public interface IBarcodeService
{
    byte[] GenerateBarcodePng(string barcodeText, int width = 300, int height = 100);
}

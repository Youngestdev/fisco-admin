import { toPng } from "html-to-image";

/**
 * Downloads a chart element as a PNG image
 * @param element - The DOM element to capture
 * @param filename - The filename for the downloaded image (without extension)
 */
export async function downloadChartAsPng(
    element: HTMLElement | null,
    filename: string
): Promise<void> {
    if (!element) {
        console.error("Element not found for download");
        return;
    }

    try {
        // Convert the element to PNG with higher quality
        const dataUrl = await toPng(element, {
            quality: 1.0,
            pixelRatio: 2, // Higher resolution for better quality
            backgroundColor: "#ffffff",
        });

        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error("Failed to download chart:", error);
    }
}

downloadHelper.js

export const downloadFile = async (url, filename = null) => {
if (!url) return;

try {
// Get file name from URL if not provided
if (!filename) {
const urlParts = url.split("/");
filename = urlParts[urlParts.length - 1].split("?")[0] || "download";
}

```
// Fetch the file as blob
const response = await fetch(url, {
  mode: "cors",
  cache: "no-cache"
});

const blob = await response.blob();

// Create temporary blob URL
const blobUrl = window.URL.createObjectURL(blob);

// Create download link
const link = document.createElement("a");
link.href = blobUrl;
link.download = filename;

document.body.appendChild(link);
link.click();

// Cleanup
link.remove();
window.URL.revokeObjectURL(blobUrl);
```

} catch (error) {
console.error("Download failed, using fallback:", error);

```
// Fallback if CORS blocks fetch
const link = document.createElement("a");
link.href = url;
link.setAttribute("download", filename || "download");
link.setAttribute("rel", "noopener");
link.target = "_blank";

document.body.appendChild(link);
link.click();
link.remove();
```

}
};

export const openDownload = (url) => {
if (!url) return;
window.open(url, "_blank", "noopener,noreferrer");
};

export const copyDownloadLink = async (url) => {
if (!url) return false;

try {
await navigator.clipboard.writeText(url);
return true;
} catch {
return false;
}
};

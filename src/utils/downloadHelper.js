downloadHelper.js

// Generate filename from URL
const getFileNameFromUrl = (url) => {
try {
const cleanUrl = url.split("?")[0]
const name = cleanUrl.split("/").pop()
return name || "media-download"
} catch {
return "media-download"
}
}

// Force download using blob
export const downloadFile = async (url, filename = null) => {
if (!url) return

try {
const name = filename || getFileNameFromUrl(url)

```
const response = await fetch(url, {
  method: "GET",
  mode: "cors",
  cache: "no-cache"
})

const blob = await response.blob()

const blobUrl = window.URL.createObjectURL(blob)

const link = document.createElement("a")
link.href = blobUrl
link.download = name
link.style.display = "none"

document.body.appendChild(link)
link.click()

document.body.removeChild(link)
window.URL.revokeObjectURL(blobUrl)
```

} catch (error) {
console.warn("Blob download failed, using fallback", error)

```
const link = document.createElement("a")
link.href = url
link.download = filename || getFileNameFromUrl(url)
link.rel = "noopener"
link.target = "_blank"

document.body.appendChild(link)
link.click()
link.remove()
```

}
}

// Open file normally
export const openDownload = (url) => {
if (!url) return
window.open(url, "_blank", "noopener,noreferrer")
}

// Copy media URL
export const copyDownloadLink = async (url) => {
if (!url) return false

try {
await navigator.clipboard.writeText(url)
return true
} catch {
return false
}
}

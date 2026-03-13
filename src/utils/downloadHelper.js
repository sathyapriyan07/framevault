export const downloadFile = async (url, filename = 'media-file') => {
  if (!url) return
  
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    // Fallback for CORS issues
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}

export const openDownload = (url) => {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

export const copyDownloadLink = async (url) => {
  if (!url) return false
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}

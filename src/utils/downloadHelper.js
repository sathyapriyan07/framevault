export const downloadFile = (url, filename = 'media-file') => {
  if (!url) return

  const nameFromUrl = url.split('/').pop()?.split('?')?.[0] || 'download'
  const resolvedFilename = filename === 'media-file' ? nameFromUrl : filename || nameFromUrl

  try {
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', resolvedFilename)
    link.setAttribute('target', '_self')
    link.setAttribute('rel', 'noopener')

    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Download failed:', error)
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

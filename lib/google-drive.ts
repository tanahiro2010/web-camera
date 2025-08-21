'use client'

interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
}

export const uploadToGoogleDrive = async (
  file: File, 
  accessToken: string
): Promise<GoogleDriveFile | null> => {
  try {
    const metadata = {
      name: file.name,
      parents: ['appDataFolder'] // Store in app-specific folder
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', file)

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: form
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error uploading to Google Drive:', error)
    return null
  }
}

export const getGoogleAccessToken = async (session: any): Promise<string | null> => {
  try {
    // Get the provider token from Supabase session
    if (session?.provider_token) {
      return session.provider_token
    }
    return null
  } catch (error) {
    console.error('Error getting Google access token:', error)
    return null
  }
}
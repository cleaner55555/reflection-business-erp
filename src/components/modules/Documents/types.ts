export interface Doc {
  id: string; title: string; category: string | null; type: string | null
  fileName: string | null; fileSize: number; status: string; partnerId: string | null
  expiresAt: string | null; notes: string | null; createdAt: string; updatedAt: string
  version?: number; tags?: string; folder?: string | null
  partner?: { id: string; name: string }

}
export interface Folder {
  id: string; name: string; parentId: string | null; color: string
  docCount: number; createdAt: string
}

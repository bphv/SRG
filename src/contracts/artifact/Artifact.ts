import type { Identifier } from '#/contracts/common/Identifier'
import type { ArtifactType } from '#/contracts/artifact/ArtifactType'
import type { Metadata } from '#/contracts/common/Metadata'

export interface Artifact {
  id: Identifier
  type: ArtifactType
  mimeType?: string
  name?: string
  content?: string
  uri?: string
  metadata?: Metadata
}

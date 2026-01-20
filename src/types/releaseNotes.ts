export interface ReleaseNote {
  id: string;
  version: string;
  title: string;
  description?: string;
  content: string;
  released_at: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  is_published: boolean;
}

export interface ReleaseNoteResponse {
  data: ReleaseNote | null;
  error?: string;
}

export interface ReleaseNotesResponse {
  data: ReleaseNote[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface CreateReleaseNoteRequest {
  version: string;
  title: string;
  description?: string;
  content: string;
  released_at: string;
  is_published?: boolean;
}

export interface UpdateReleaseNoteRequest {
  version?: string;
  title?: string;
  description?: string;
  content?: string;
  released_at?: string;
  is_published?: boolean;
}

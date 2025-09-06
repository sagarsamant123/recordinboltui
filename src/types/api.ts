export interface AudioFile {
  filename: string;
  size: number;
  created: string;
  modified: string;
}

export interface SidInfo {
  sid: string;
  createdT: string;
  files: AudioFile[];
}

export interface GroupData {
  threadId: string;
  title: string;
  ndcId: number;
  iconUrl: string | null;
  sid_info: SidInfo[];
}

export interface OutputInfoResponse {
  success: boolean;
  data: Record<string, GroupData>;
}
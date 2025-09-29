// Annotation data types for client feedback
export interface Annotation {
  id: string;
  timestamp: Date;
  route: string;
  viewport: string;
  position: { x: number; y: number };
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved';
}

export interface AnnotationSession {
  sessionId: string;
  createdAt: Date;
  annotations: Annotation[];
}

export interface DownloadBundle {
  session: AnnotationSession;
  screenshots: { [route: string]: string }; // base64 encoded images
}
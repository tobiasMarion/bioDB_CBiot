export interface User {
  id: string;
  externalAuthId: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: Date;
  archived: boolean;
  archivedAt: Date | null;
}

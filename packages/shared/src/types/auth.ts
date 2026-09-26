export type DemoProfileId = 'post-punk' | 'synthwave' | 'indie-folk';

export interface AuthStatus {
  readonly isAuthenticated: boolean;
  readonly isDemo: boolean;
  readonly demoProfileId?: DemoProfileId;
  readonly userId?: string;
  readonly displayName?: string;
}

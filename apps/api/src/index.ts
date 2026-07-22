export interface HealthStatus {
  readonly service: 'abapilot-api';
  readonly version: string;
  readonly status: 'ok';
}

export const getHealthStatus = (): HealthStatus => ({
  service: 'abapilot-api',
  version: '0.1.0',
  status: 'ok',
});

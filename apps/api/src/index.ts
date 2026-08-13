export interface HealthStatus {
  readonly service: 'abapcompass-api';
  readonly version: string;
  readonly status: 'ok';
}

export const getHealthStatus = (): HealthStatus => ({
  service: 'abapcompass-api',
  version: '0.2.0',
  status: 'ok',
});

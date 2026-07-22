export interface WorkspaceModule {
  readonly id: string;
  readonly label: string;
  readonly enabled: boolean;
}

export const getInitialModules = (): readonly WorkspaceModule[] => [
  { id: 'diagnosis', label: 'Diagnóstico de incidencias', enabled: false },
  { id: 'sap-explorer', label: 'Explorador SAP', enabled: false },
  { id: 'abap-generator', label: 'Generador ABAP', enabled: false },
];

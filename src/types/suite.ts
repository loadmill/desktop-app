export type SuiteOption = {
  description: string;
  id: string;
};

export type TestSuite = SuiteOption & { [key: string]: unknown };

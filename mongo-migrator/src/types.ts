// Define the Migration interface
export interface IMigration {
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

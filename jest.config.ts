import { defaults } from "jest-config";
import { InitialOptionsTsJest } from "ts-jest";

export default {
  clearMocks: true,
  detectOpenHandles: true,
  forceExit: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions],
  preset: "ts-jest",
  roots: ["<rootDir>/server"],
  testEnvironment: "node",
  testMatch: ["**/__test__/?(*.)+(test|spec).ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  verbose: true,
} as InitialOptionsTsJest;

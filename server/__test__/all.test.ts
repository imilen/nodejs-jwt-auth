import supertest from "supertest";
import each from "jest-each";

import { app } from "../app";
/**
 * Mocks
 */
jest.mock("ioredis", () => jest.requireActual("ioredis-mock"));
jest.mock("../utils/jwt", () => {
  const module = jest.requireActual("../utils/jwt");

  return {
    ...module,
    generateJwtKeys: jest.fn(),
  };
});

describe("all", () => {
  describe("app", () => {
    describe("routes", () => {
      describe("home route", () => {
        beforeEach(async () => {});
        afterEach(async () => {});
        each`
          expected
          ${200}
        `.test("should return status $expected", async ({ expected }) => {
          let res = await supertest(app).get("/");
          expect(res.statusCode).toEqual(expected);
        });
      });
    });
  });

  describe("parameterized test", () => {
    each`
      pass                 | check
      ${"demo@demo.com"}   | ${"demo@demo.com"}
      ${"admin@admin.com"} | ${"admin@admin.com"}
    `.test("example $pass", async ({ pass, check }) => {
      expect(pass).toEqual(check);
    });
  });
});

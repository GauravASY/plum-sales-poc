import { describe, it, expect } from "vitest";
import path from "node:path";
import { CsvDataSource, __testing } from "./csvLoader.js";

const SAMPLE_CSV = path.resolve(__dirname, "../../../../data/sample.csv");

describe("normalizeHeader", () => {
  it("normalizes messy headers", () => {
    expect(__testing.normalizeHeader("Mob No.")).toBe("mob_no");
    expect(__testing.normalizeHeader("Query ")).toBe("query");
    expect(__testing.normalizeHeader("MeMber Status")).toBe("member_status");
    expect(__testing.normalizeHeader("Cult purcashe date")).toBe("cult_purcashe_date");
    expect(__testing.normalizeHeader("Pre Filled Form Details (Age)")).toBe(
      "pre_filled_form_details_age",
    );
  });
});

describe("normalizeMobile", () => {
  it("strips non-digits and country code", () => {
    expect(__testing.normalizeMobile("+91 98765 43210")).toBe("9876543210");
    expect(__testing.normalizeMobile("9876543210")).toBe("9876543210");
    expect(__testing.normalizeMobile("091-9876543210")).toBe("9876543210");
  });
});

describe("toIsoDate", () => {
  it("handles common formats", () => {
    expect(__testing.toIsoDate("2024-05-10")).toBe("2024-05-10");
    expect(__testing.toIsoDate("10/05/2024")).toBe("2024-05-10");
    expect(__testing.toIsoDate("10-5-2024")).toBe("2024-05-10");
    expect(__testing.toIsoDate("")).toBeNull();
    expect(__testing.toIsoDate("not a date")).toBeNull();
  });
});

describe("toYesNo", () => {
  it("normalizes truthy/falsy strings", () => {
    expect(__testing.toYesNo("Yes")).toBe("Yes");
    expect(__testing.toYesNo("no")).toBe("No");
    expect(__testing.toYesNo("")).toBeNull();
    expect(__testing.toYesNo("maybe")).toBeNull();
  });
});

describe("CsvDataSource (sample.csv)", () => {
  it("loads all rows and finds by email and mobile", async () => {
    const ds = new CsvDataSource(SAMPLE_CSV);
    await ds.load();

    expect(ds.all().length).toBeGreaterThanOrEqual(10);

    const byEmail = ds.findByContact("test1@example.com");
    expect(byEmail).not.toBeNull();
    expect(byEmail?.identifiers.name).toBe("John Doe");
    expect(byEmail?.identifiers.orgBrandName).toBe("Acme Corp");
    expect(byEmail?.identifiers.sumInsured).toBe(500000);
    expect(byEmail?.lead.query).toBe("Need info");
    expect(byEmail?.perks.perksBought).toBe("Yes");
    expect(byEmail?.perks.lastPerkBought).toBe("Gym");
    expect(byEmail?.claims.claimExperience).toBe("No");
    expect(byEmail?.prefill.age).toBe(35);

    const byMobile = ds.findByContact("9876543210");
    expect(byMobile?.id).toBe(byEmail?.id);

    const withCountryCode = ds.findByContact("+91 98765 43210");
    expect(withCountryCode?.id).toBe(byEmail?.id);
  });

  it("returns null for unknown contacts", async () => {
    const ds = new CsvDataSource(SAMPLE_CSV);
    await ds.load();
    expect(ds.findByContact("nope@nowhere.com")).toBeNull();
    expect(ds.findByContact("0000000000")).toBeNull();
  });
});

describe("parseCsv", () => {
  it("throws when required columns are missing", () => {
    const content = "FooBar,Hello\n1,2\n";
    expect(() => __testing.parseCsv(content)).toThrow(/missing required columns/i);
  });
});

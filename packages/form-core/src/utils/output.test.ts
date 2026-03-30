import { describe, expect, it } from "vitest";
import {
  expandPathKeys,
  flattenToPathKeys,
  transformFormOutput,
} from "./output";

describe("flattenToPathKeys", () => {
  it("flattens nested plain objects", () => {
    expect(
      flattenToPathKeys({
        profile: {
          name: "Ada",
          stats: {
            visits: 3,
          },
        },
      }),
    ).toEqual({
      "profile.name": "Ada",
      "profile.stats.visits": 3,
    });
  });

  it("preserves arrays and primitives as leaf values", () => {
    expect(
      flattenToPathKeys({
        tags: ["a", "b"],
        active: true,
      }),
    ).toEqual({
      tags: ["a", "b"],
      active: true,
    });
  });

  it("escapes delimiter characters inside keys", () => {
    expect(
      flattenToPathKeys(
        {
          "user.info": {
            "first.name": "Ada",
          },
        },
        ".",
      ),
    ).toEqual({
      "user\\.info.first\\.name": "Ada",
    });
  });
});

describe("expandPathKeys", () => {
  it("expands flattened path keys into nested objects", () => {
    expect(
      expandPathKeys({
        "profile.name": "Ada",
        "profile.stats.visits": 3,
      }),
    ).toEqual({
      profile: {
        name: "Ada",
        stats: {
          visits: 3,
        },
      },
    });
  });

  it("restores escaped delimiter characters inside keys", () => {
    expect(
      expandPathKeys(
        {
          "user\\.info.first\\.name": "Ada",
        },
        ".",
      ),
    ).toEqual({
      "user.info": {
        "first.name": "Ada",
      },
    });
  });

  it("supports custom delimiters", () => {
    expect(
      expandPathKeys(
        {
          "profile__name": "Ada",
          "profile__role": "admin",
        },
        "__",
      ),
    ).toEqual({
      profile: {
        name: "Ada",
        role: "admin",
      },
    });
  });
});

describe("transformFormOutput", () => {
  it("returns data unchanged when no config is provided", () => {
    const data = {
      profile: {
        name: "Ada",
      },
    };

    expect(transformFormOutput(data)).toBe(data);
  });

  it("flattens nested data when path output is requested", () => {
    expect(
      transformFormOutput(
        {
          profile: {
            name: "Ada",
          },
        },
        { type: "path" },
      ),
    ).toEqual({
      "profile.name": "Ada",
    });
  });

  it("leaves arrays unchanged when transforming top-level non-objects", () => {
    const data = ["a", "b"];
    expect(transformFormOutput(data, { type: "path" })).toBe(data);
  });
});

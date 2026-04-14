// =============================================================================
// Expr<T> type system tests
// =============================================================================
// Tests for the unified expression type system: Expr<T>, ExprContext, Condition,
// FormRegistries, and deprecated type aliases.

import { describe, it, expectTypeOf } from "vitest";
import type {
  Expr,
  ExprBoolean,
  ExprString,
  ExprText,
  ExprNumber,
  ExprContext,
  Condition,
  FormRegistries,
  FnRegistry,
  ExprFn,
  VisibilityCondition,
  // Field types that use Expr
  FormSchema,
  TextField,
  OptionsConfig,
  FieldOption,
} from "../src";

// ============================================================================
// Expr<T> — accepts all node shapes
// ============================================================================

describe("Expr<T> type system", () => {
  // --- Primitives ---
  it("accepts plain primitive values", () => {
    const _string: Expr<string> = "hello";
    const _number: Expr<number> = 42;
    const _boolean: Expr<boolean> = true;
    const _object: Expr<Record<string, unknown>> = { a: 1 };

    expectTypeOf(_string).toEqualTypeOf<Expr<string>>();
    expectTypeOf(_number).toEqualTypeOf<Expr<number>>();
    expectTypeOf(_boolean).toEqualTypeOf<Expr<boolean>>();
    void _object;
  });

  // --- $data references ---
  it("accepts $data references", () => {
    const _str: Expr<string> = { $data: "/name" };
    const _num: Expr<number> = { $data: "/age" };
    const _bool: Expr<boolean> = { $data: "/isActive" };

    expectTypeOf(_str).toMatchTypeOf<Expr<string>>();
    expectTypeOf(_num).toMatchTypeOf<Expr<number>>();
    expectTypeOf(_bool).toMatchTypeOf<Expr<boolean>>();
  });

  // --- $context references ---
  it("accepts $context references", () => {
    const _str: Expr<string> = { $context: "/user.name" };
    const _num: Expr<number> = { $context: "/user.age" };
    const _bool: Expr<boolean> = { $context: "/permissions.canEdit" };

    expectTypeOf(_str).toMatchTypeOf<Expr<string>>();
    expectTypeOf(_num).toMatchTypeOf<Expr<number>>();
    expectTypeOf(_bool).toMatchTypeOf<Expr<boolean>>();
  });

  // --- $when / $then / $else branching ---
  it("accepts $when conditional branching", () => {
    const _bool: Expr<boolean> = {
      $when: true,
      $then: false,
      $else: true,
    };

    const _str: Expr<string> = {
      $when: { $data: "role" },
      $then: "admin",
      $else: "user",
    };

    const _nested: Expr<string> = {
      $when: { $data: "role", eq: "admin" },
      $then: {
        $when: { $data: "region" },
        $then: "admin-eu",
        $else: "admin-us",
      },
      $else: "viewer",
    };

    expectTypeOf(_bool).toMatchTypeOf<Expr<boolean>>();
    expectTypeOf(_str).toMatchTypeOf<Expr<string>>();
    expectTypeOf(_nested).toMatchTypeOf<Expr<string>>();
  });

  // --- $fn registry calls ---
  it("accepts $fn expression nodes", () => {
    const _noArgs: Expr<string> = { $fn: "formatName" };
    const _staticArgs: Expr<string> = {
      $fn: "formatName",
      args: { first: "John", last: "Doe" },
    };
    const _dynamicArgs: Expr<boolean> = {
      $fn: "hasPermission",
      args: {
        role: { $data: "/role" },
        permission: "edit",
      },
    };

    expectTypeOf(_noArgs).toMatchTypeOf<Expr<string>>();
    expectTypeOf(_staticArgs).toMatchTypeOf<Expr<string>>();
    expectTypeOf(_dynamicArgs).toMatchTypeOf<Expr<boolean>>();
  });

  // --- $text template interpolation ---
  it("accepts $text template nodes", () => {
    const _template: Expr<string> = { $text: "Hello, ${/name}!" };

    expectTypeOf(_template).toMatchTypeOf<Expr<string>>();
  });

  // --- Inline functions ---
  it("accepts inline function expressions", () => {
    const _fn: Expr<boolean> = (ctx) => ctx.data.role === "admin";
    const _strFn: Expr<string> = (ctx) => `Hello, ${ctx.data.name}!`;

    expectTypeOf(_fn).toMatchTypeOf<Expr<boolean>>();
    expectTypeOf(_strFn).toMatchTypeOf<Expr<string>>();
  });

  // --- Arrays (implicit AND for booleans) ---
  it("accepts arrays as implicit AND for Expr<boolean>", () => {
    const _implicitAnd: Expr<boolean> = [
      { $data: "role", eq: "admin" },
      { $data: "status", eq: "active" },
    ];

    expectTypeOf(_implicitAnd).toMatchTypeOf<Expr<boolean>>();
  });
});

// ============================================================================
// Condition — restricted boolean predicate sub-type
// ============================================================================

describe("Condition type", () => {
  it("accepts boolean literals", () => {
    const _true: Condition = true;
    const _false: Condition = false;

    expectTypeOf(_true).toEqualTypeOf<Condition>();
    expectTypeOf(_false).toEqualTypeOf<Condition>();
  });

  it("accepts atomic conditions", () => {
    const _eq: Condition = { $data: "role", eq: "admin" };
    const _neq: Condition = { $data: "status", neq: "banned" };
    const _gt: Condition = { $data: "age", gt: 18 };
    const _ctx: Condition = { $context: "user.role", eq: "admin" };

    expectTypeOf(_eq).toMatchTypeOf<Condition>();
    expectTypeOf(_neq).toMatchTypeOf<Condition>();
    expectTypeOf(_gt).toMatchTypeOf<Condition>();
    expectTypeOf(_ctx).toMatchTypeOf<Condition>();
  });

  it("accepts implicit AND arrays", () => {
    const _array: Condition = [
      { $data: "role", eq: "admin" },
      { $data: "status", eq: "active" },
    ];

    expectTypeOf(_array).toMatchTypeOf<Condition>();
  });

  it("accepts $and / $or groups", () => {
    const _and: Condition = {
      $and: [
        { $data: "role", eq: "admin" },
        { $data: "status", eq: "active" },
      ],
    };

    const _or: Condition = {
      $or: [
        { $data: "role", eq: "admin" },
        { $data: "role", eq: "moderator" },
      ],
    };

    expectTypeOf(_and).toMatchTypeOf<Condition>();
    expectTypeOf(_or).toMatchTypeOf<Condition>();
  });
});

// ============================================================================
// Expr<boolean> — superset of Condition
// ============================================================================

describe("Expr<boolean> is a superset of Condition", () => {
  it("accepts everything Condition accepts, plus $when, $fn, $text, functions", () => {
    // All Condition shapes work as Expr<boolean>:
    const _bool: Expr<boolean> = true;
    const _atomic: Expr<boolean> = { $data: "role", eq: "admin" };
    const _array: Expr<boolean> = [{ $data: "role", eq: "admin" }];
    const _and: Expr<boolean> = { $and: [{ $data: "role", eq: "admin" }] };
    const _or: Expr<boolean> = { $or: [{ $data: "role", eq: "admin" }] };

    // Plus Condition cannot express:
    const _when: Expr<boolean> = {
      $when: { $data: "role", eq: "admin" },
      $then: true,
      $else: false,
    };
    const _fn: Expr<boolean> = { $fn: "isLocked" };
    const _text: Expr<boolean> = { $text: "${/count} > 0" };
    const _inline: Expr<boolean> = (ctx) => ctx.data.role === "admin";

    expectTypeOf(_bool).toMatchTypeOf<Expr<boolean>>();
    expectTypeOf(_atomic).toMatchTypeOf<Expr<boolean>>();
    expectTypeOf(_array).toMatchTypeOf<Expr<boolean>>();
    expectTypeOf(_and).toMatchTypeOf<Expr<boolean>>();
    expectTypeOf(_or).toMatchTypeOf<Expr<boolean>>();
    expectTypeOf(_when).toMatchTypeOf<Expr<boolean>>();
    expectTypeOf(_fn).toMatchTypeOf<Expr<boolean>>();
    expectTypeOf(_text).toMatchTypeOf<Expr<boolean>>();
    expectTypeOf(_inline).toMatchTypeOf<Expr<boolean>>();
  });
});

// ============================================================================
// Convenience aliases
// ============================================================================

describe("convenience aliases", () => {
  it("ExprBoolean behaves like Expr<boolean>", () => {
    const _plain: ExprBoolean = true;
    const _data: ExprBoolean = { $data: "/isActive" };
    const _when: ExprBoolean = {
      $when: { $data: "role", eq: "admin" },
      $then: true,
      $else: false,
    };
    const _fn: ExprBoolean = { $fn: "isLocked" };
    const _inline: ExprBoolean = (ctx) => ctx.data.isActive === true;

    expectTypeOf(_plain).toMatchTypeOf<ExprBoolean>();
    expectTypeOf(_data).toMatchTypeOf<ExprBoolean>();
    expectTypeOf(_when).toMatchTypeOf<ExprBoolean>();
    expectTypeOf(_fn).toMatchTypeOf<ExprBoolean>();
    expectTypeOf(_inline).toMatchTypeOf<ExprBoolean>();
  });

  it("ExprString behaves like Expr<string>", () => {
    const _plain: ExprString = "hello";
    const _data: ExprString = { $data: "/name" };
    const _when: ExprString = {
      $when: { $data: "role", eq: "admin" },
      $then: "Admin",
      $else: "User",
    };
    const _fn: ExprString = { $fn: "formatName" };

    expectTypeOf(_plain).toMatchTypeOf<ExprString>();
    expectTypeOf(_data).toMatchTypeOf<ExprString>();
    expectTypeOf(_when).toMatchTypeOf<ExprString>();
    expectTypeOf(_fn).toMatchTypeOf<ExprString>();
  });

  it("ExprNumber behaves like Expr<number>", () => {
    const _plain: ExprNumber = 42;
    const _data: ExprNumber = { $data: "/age" };
    const _fn: ExprNumber = { $fn: "calculateTotal" };

    expectTypeOf(_plain).toMatchTypeOf<ExprNumber>();
    expectTypeOf(_data).toMatchTypeOf<ExprNumber>();
    expectTypeOf(_fn).toMatchTypeOf<ExprNumber>();
  });
});

// ============================================================================
// ExprContext
// ============================================================================

describe("ExprContext", () => {
  it("has data and optional context properties", () => {
    const _minCtx: ExprContext = { data: {} };
    const _fullCtx: ExprContext = {
      data: { name: "John", age: 30 },
      context: { user: { role: "admin" }, permissions: ["edit", "view"] },
    };

    expectTypeOf(_minCtx.data).toEqualTypeOf<Record<string, unknown>>();
    expectTypeOf(_fullCtx.data).toEqualTypeOf<Record<string, unknown>>();
    expectTypeOf(_fullCtx.context).toEqualTypeOf<
      Record<string, unknown> | undefined
    >();

    // Inline function receives ExprContext
    const _fn: Expr<boolean> = (ctx) => {
      expectTypeOf(ctx.data).toEqualTypeOf<Record<string, unknown>>();
      expectTypeOf(ctx.context).toEqualTypeOf<
        Record<string, unknown> | undefined
      >();
      return ctx.data.role === "admin";
    };

    void _minCtx;
    void _fn;
  });
});

// ============================================================================
// FormRegistries
// ============================================================================

describe("FormRegistries", () => {
  it("has validators, resolvers, and fns properties", () => {
    const _empty: FormRegistries = {};
    const _fnsOnly: FormRegistries = {
      fns: {
        formatName: (ctx) => `${ctx.data.firstName} ${ctx.data.lastName}`,
        isLocked: (ctx) => ctx.data.status === "locked",
      },
    };
    const _full: FormRegistries = {
      validators: {
        isUnique: (value: unknown) => typeof value === "string" && value.length > 0,
      },
      resolvers: {
        fetchOptions: async () => [{ label: "A", value: "a" }],
      },
      fns: {
        calculate: () => 42,
      },
    };

    expectTypeOf(_empty).toMatchTypeOf<FormRegistries>();
    expectTypeOf(_fnsOnly).toMatchTypeOf<FormRegistries>();
    expectTypeOf(_full).toMatchTypeOf<FormRegistries>();
  });

  it("FnRegistry maps string keys to ExprFn", () => {
    const _fn: ExprFn = (ctx) => ctx.data.value;
    const _registry: FnRegistry = {
      myFn: _fn,
      anotherFn: (ctx) => ctx.args?.input,
    };

    expectTypeOf(_registry).toMatchTypeOf<FnRegistry>();
  });
});

// ============================================================================
// Deprecated type aliases — backward compatibility
// ============================================================================

describe("deprecated type aliases", () => {
  it("VisibilityCondition is an alias for Condition", () => {
    const _vis: VisibilityCondition = { $data: "role", eq: "admin" };
    const _cond: Condition = _vis;

    expectTypeOf(_vis).toEqualTypeOf<Condition>();
    expectTypeOf(_cond).toEqualTypeOf<Condition>();
  });
});

// ============================================================================
// Widened field properties
// ============================================================================

describe("widened field properties accept Expr", () => {
  it("BaseField.label accepts ExprText", () => {
    const _string: TextField = { type: "text", name: "name", label: "Full Name" };
    const _data: TextField = { type: "text", name: "name", label: { $data: "/labels.name" } };
    const _text: TextField = { type: "text", name: "name", label: { $text: "Hello, ${/name}!" } };
    const _fn: TextField = { type: "text", name: "name", label: (ctx) => `Label for ${ctx.data.id}` };

    expectTypeOf(_string.label).toMatchTypeOf<ExprText | undefined>();
    expectTypeOf(_data.label).toMatchTypeOf<ExprText | undefined>();
    expectTypeOf(_text.label).toMatchTypeOf<ExprText | undefined>();
    expectTypeOf(_fn.label).toMatchTypeOf<ExprText | undefined>();
  });

  it("BaseField.placeholder accepts ExprString", () => {
    const _string: TextField = { type: "text", name: "name", placeholder: "Enter name" };
    const _data: TextField = { type: "text", name: "name", placeholder: { $data: "/placeholders.name" } };
    const _fn: TextField = { type: "text", name: "name", placeholder: (ctx) => `Type ${ctx.data.fieldName}` };

    expectTypeOf(_string.placeholder).toMatchTypeOf<ExprString | undefined>();
    expectTypeOf(_data.placeholder).toMatchTypeOf<ExprString | undefined>();
    expectTypeOf(_fn.placeholder).toMatchTypeOf<ExprString | undefined>();
  });

  it("BaseField.disabled accepts Expr<boolean>", () => {
    const _bool: TextField = { type: "text", name: "name", disabled: true };
    const _data: TextField = { type: "text", name: "name", disabled: { $data: "/isLocked" } };
    const _cond: TextField = { type: "text", name: "name", disabled: { $data: "role", eq: "viewer" } };
    const _when: TextField = {
      type: "text",
      name: "name",
      disabled: {
        $when: { $data: "status", eq: "review" },
        $then: true,
        $else: false,
      },
    };
    const _fn: TextField = { type: "text", name: "name", disabled: (ctx) => ctx.data.status === "locked" };

    expectTypeOf(_bool.disabled).toMatchTypeOf<Expr<boolean> | undefined>();
    expectTypeOf(_data.disabled).toMatchTypeOf<Expr<boolean> | undefined>();
    expectTypeOf(_cond.disabled).toMatchTypeOf<Expr<boolean> | undefined>();
    expectTypeOf(_when.disabled).toMatchTypeOf<Expr<boolean> | undefined>();
    expectTypeOf(_fn.disabled).toMatchTypeOf<Expr<boolean> | undefined>();
  });

  it("BaseField.condition accepts Expr<boolean>", () => {
    const _bool: TextField = { type: "text", name: "name", condition: true };
    const _data: TextField = { type: "text", name: "name", condition: { $data: "/showName" } };
    const _cond: TextField = { type: "text", name: "name", condition: { $data: "role", eq: "admin" } };

    expectTypeOf(_bool.condition).toMatchTypeOf<Expr<boolean> | undefined>();
    expectTypeOf(_data.condition).toMatchTypeOf<Expr<boolean> | undefined>();
    expectTypeOf(_cond.condition).toMatchTypeOf<Expr<boolean> | undefined>();
  });

  it("BaseField.defaultValue accepts Expr<TValue>", () => {
    const _string: TextField = { type: "text", name: "name", defaultValue: "John" };
    const _data: TextField = { type: "text", name: "name", defaultValue: { $data: "/defaultName" } };
    const _fn: TextField = { type: "text", name: "name", defaultValue: (ctx) => `User ${ctx.data.id}` };

    expectTypeOf(_string.defaultValue).toMatchTypeOf<Expr<string> | undefined>();
    expectTypeOf(_data.defaultValue).toMatchTypeOf<Expr<string> | undefined>();
    expectTypeOf(_fn.defaultValue).toMatchTypeOf<Expr<string> | undefined>();
  });

  it("FieldOption.disabled accepts Expr<boolean>", () => {
    const _bool: FieldOption = { label: "A", value: "a", disabled: true };
    const _data: FieldOption = { label: "A", value: "a", disabled: { $data: "/isDisabled" } };
    const _cond: FieldOption = { label: "A", value: "a", disabled: { $data: "role", neq: "admin" } };
    const _fn: FieldOption = { label: "A", value: "a", disabled: (ctx) => ctx.data.locked };

    expectTypeOf(_bool.disabled).toMatchTypeOf<Expr<boolean> | undefined>();
    expectTypeOf(_data.disabled).toMatchTypeOf<Expr<boolean> | undefined>();
    expectTypeOf(_cond.disabled).toMatchTypeOf<Expr<boolean> | undefined>();
    expectTypeOf(_fn.disabled).toMatchTypeOf<Expr<boolean> | undefined>();
  });
});

// ============================================================================
// OptionsConfig
// ============================================================================

describe("OptionsConfig", () => {
  it("accepts static options array", () => {
    const _static: OptionsConfig = [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
    ];

    expectTypeOf(_static).toMatchTypeOf<OptionsConfig>();
  });

  it("accepts resolver config for async resolution", () => {
    const _resolver: OptionsConfig = {
      resolver: "fetchOptions",
      args: { country: "US" },
    };

    expectTypeOf(_resolver).toMatchTypeOf<OptionsConfig>();
  });
});

// ============================================================================
// Existing schemas still type-check unchanged
// ============================================================================

describe("backward compatibility with existing schemas", () => {
  it("existing DynamicValue-based schemas still type-check", () => {
    const schema: FormSchema = {
      fields: [
        {
          type: "text",
          name: "name",
          label: { $data: "/labels.name" },
          placeholder: { $data: "/placeholders.name" },
          disabled: { $data: "/isLocked" },
          required: { $data: "role", eq: "admin" },
          condition: { $and: [{ $data: "showName" }, { $data: "isAdmin" }] },
          defaultValue: { $data: "/defaultName" },
        },
        {
          type: "select",
          name: "role",
          label: "Role",
          options: [
            { label: "Admin", value: "admin" },
            { label: "User", value: "user", disabled: { $data: "isSelf" } },
          ],
        },
        {
          type: "row",
          hidden: { $data: "hideSection" },
          fields: [
            { type: "text", name: "field1" },
          ],
        },
      ],
    };

    expectTypeOf(schema).toMatchTypeOf<FormSchema>();
  });
});

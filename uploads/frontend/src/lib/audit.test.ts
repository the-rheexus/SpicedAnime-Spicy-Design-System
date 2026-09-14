import { describe, expect, it } from "vitest";

import {
  auditActionHasFriendlyLabel,
  auditActionLabel,
  auditActorLabel,
  auditEntityLabel,
} from "@/lib/audit";
import type { AuditEvent } from "@/lib/types";

function event(overrides: Partial<AuditEvent>): AuditEvent {
  return {
    id: 1,
    actor_type: "system",
    action: "x",
    entity_type: "Order",
    entity_id: "5",
    created_at: "2026-08-27T00:00:00Z",
    ...overrides,
  };
}

describe("auditActorLabel", () => {
  it("prefers the serializer label, then translates the raw type", () => {
    expect(auditActorLabel(event({ actor_label: "Operator" }))).toBe("Operator");
    expect(auditActorLabel(event({ actor_type: "webhook", actor_label: null }))).toBe("Webhook");
    expect(auditActorLabel(event({ actor_type: "custom-actor", actor_label: null }))).toBe("Custom-actor");
  });
});

describe("auditEntityLabel", () => {
  it("prefers the serializer label with a real identifier", () => {
    expect(auditEntityLabel(event({ entity_label: "Order #3479" }))).toBe("Order #3479");
  });

  it("falls back to a friendly noun and id", () => {
    expect(auditEntityLabel(event({ entity_type: "ProductionBatch", entity_id: "37", entity_label: null }))).toBe(
      "Batch #37",
    );
    expect(auditEntityLabel(event({ entity_type: "Authentication", entity_id: null, entity_label: null }))).toBe(
      "Authentication",
    );
  });
});

describe("auditActionLabel", () => {
  it("translates known actions and identifies the secondary raw detail", () => {
    const auditEvent = event({ action: "shopify_order_reconciled" });
    expect(auditActionLabel(auditEvent)).toBe("Shopify order reconciled");
    expect(auditActionHasFriendlyLabel(auditEvent)).toBe(true);
  });

  it("leaves unknown actions raw instead of inventing wording", () => {
    const auditEvent = event({ action: "future_action_without_contract" });
    expect(auditActionLabel(auditEvent)).toBe("future_action_without_contract");
    expect(auditActionHasFriendlyLabel(auditEvent)).toBe(false);
  });
});

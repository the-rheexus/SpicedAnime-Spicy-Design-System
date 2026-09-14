import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { expect, it } from "vitest";

it("renders with Testing Library and has no basic axe violations", async () => {
  const { container } = render(
    <main>
      <h1>Test harness</h1>
      <button type="button">Continue</button>
    </main>,
  );

  expect(screen.getByRole("heading", { name: "Test harness" })).toBeVisible();
  expect(
    (await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    })).violations,
  ).toEqual([]);
});

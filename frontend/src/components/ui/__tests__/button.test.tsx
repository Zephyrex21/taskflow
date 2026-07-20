import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "../button"

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeDefined()
  })

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Submit</Button>)
    fireEvent.click(screen.getByText("Submit"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("does not fire onClick when disabled", () => {
    const handleClick = vi.fn()
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    )
    fireEvent.click(screen.getByText("Disabled"))
    expect(handleClick).not.toHaveBeenCalled()
  })
})

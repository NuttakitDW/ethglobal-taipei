import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { OtpInput } from "@/components/otp-input"

describe("OtpInput Component", () => {
  const mockOnComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders correct number of inputs", () => {
    render(<OtpInput length={6} onComplete={mockOnComplete} />)

    const inputs = screen.getAllByRole("textbox")
    expect(inputs).toHaveLength(6)
  })

  it("focuses on first input on mount", () => {
    render(<OtpInput length={6} onComplete={mockOnComplete} />)

    const inputs = screen.getAllByRole("textbox")
    expect(document.activeElement).toBe(inputs[0])
  })

  it("moves focus to next input after value entry", async () => {
    const user = userEvent.setup()
    render(<OtpInput length={6} onComplete={mockOnComplete} />)

    const inputs = screen.getAllByRole("textbox")

    await user.type(inputs[0], "1")
    expect(document.activeElement).toBe(inputs[1])
  })

  it("allows only numeric input", async () => {
    const user = userEvent.setup()
    render(<OtpInput length={6} onComplete={mockOnComplete} />)

    const inputs = screen.getAllByRole("textbox")

    await user.type(inputs[0], "a")
    expect(inputs[0]).toHaveValue("")

    await user.type(inputs[0], "1")
    expect(inputs[0]).toHaveValue("1")
  })

  it("calls onComplete when all inputs are filled", async () => {
    const user = userEvent.setup()
    render(<OtpInput length={6} onComplete={mockOnComplete} />)

    const inputs = screen.getAllByRole("textbox")

    await user.type(inputs[0], "1")
    await user.type(inputs[1], "2")
    await user.type(inputs[2], "3")
    await user.type(inputs[3], "4")
    await user.type(inputs[4], "5")
    await user.type(inputs[5], "6")

    expect(mockOnComplete).toHaveBeenCalledWith("123456")
  })

  it("handles backspace key correctly", async () => {
    const user = userEvent.setup()
    render(<OtpInput length={6} onComplete={mockOnComplete} />)

    const inputs = screen.getAllByRole("textbox")

    // Fill the first input
    await user.type(inputs[0], "1")
    expect(inputs[0]).toHaveValue("1")
    expect(document.activeElement).toBe(inputs[1])

    // Press backspace
    await user.keyboard("{Backspace}")

    // Focus should move to the previous input and clear it
    expect(document.activeElement).toBe(inputs[0])
    expect(inputs[0]).toHaveValue("")
  })

  it("handles paste event correctly", () => {
    render(<OtpInput length={6} onComplete={mockOnComplete} />)

    const inputs = screen.getAllByRole("textbox")

    // Create a paste event with clipboard data
    const pasteEvent = {
      clipboardData: {
        getData: jest.fn().mockReturnValue("123456"),
      },
      preventDefault: jest.fn(),
    }

    fireEvent.paste(inputs[0], pasteEvent)

    expect(pasteEvent.preventDefault).toHaveBeenCalled()
    expect(mockOnComplete).toHaveBeenCalledWith("123456")
  })
})


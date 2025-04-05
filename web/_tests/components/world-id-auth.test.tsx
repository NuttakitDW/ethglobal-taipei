import { render, screen, fireEvent } from "@testing-library/react"
import { WorldIDAuth } from "@/components/world-id-auth"

// Mock the toast hook
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe("WorldIDAuth Component", () => {
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("renders with default button text", () => {
    render(<WorldIDAuth onSuccess={mockOnSuccess} />)

    const button = screen.getByRole("button")
    expect(button).toHaveTextContent("Verify with World ID")
  })

  it("renders with custom button text", () => {
    const customText = "Custom Verify Button"
    render(<WorldIDAuth onSuccess={mockOnSuccess} buttonText={customText} />)

    const button = screen.getByRole("button")
    expect(button).toHaveTextContent(customText)
  })

  it("shows loading state while verifying", () => {
    render(<WorldIDAuth onSuccess={mockOnSuccess} />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    expect(button).toHaveTextContent("Verifying...")
    expect(button).toBeDisabled()
  })

  it("calls onSuccess after verification", () => {
    render(<WorldIDAuth onSuccess={mockOnSuccess} />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    // Fast forward through the timeout
    jest.advanceTimersByTime(2000)

    expect(mockOnSuccess).toHaveBeenCalled()
    expect(button).not.toBeDisabled()
  })
})


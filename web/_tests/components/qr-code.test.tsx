import { render, screen } from "@testing-library/react"
import { QRCode } from "@/components/qr-code"

// Mock QRCode.js module
jest.mock("qrcode", () => ({
  __esModule: true,
  default: {
    toCanvas: jest.fn((canvas, data, options) => Promise.resolve()),
  },
}))

describe("QRCode Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders a canvas element", () => {
    render(<QRCode data="test data" />)

    const canvas = screen.getByRole("img", { hidden: true })
    expect(canvas).toBeInTheDocument()
    expect(canvas.tagName.toLowerCase()).toBe("canvas")
  })

  it("applies custom size prop", () => {
    const customSize = 300
    render(<QRCode data="test data" size={customSize} />)

    const canvas = screen.getByRole("img", { hidden: true })
    expect(canvas).toHaveAttribute("width", String(customSize))
    expect(canvas).toHaveAttribute("height", String(customSize))
  })

  it("applies custom className prop", () => {
    const customClass = "test-class"
    render(<QRCode data="test data" className={customClass} />)

    // The class should be on the parent div
    const parentDiv = screen.getByRole("img", { hidden: true }).parentElement
    expect(parentDiv).toHaveClass(customClass)
  })

  it("shows placeholder icon when no data is provided", () => {
    render(<QRCode data="" />)

    const icon = screen.getByTestId("qr-icon")
    expect(icon).toBeInTheDocument()
  })
})


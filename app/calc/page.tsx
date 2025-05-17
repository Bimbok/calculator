import Calculator from "../../calculator"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calci",
  description: "A modern, animated calculator web application",
}

export default function Page() {
  return <Calculator />
}

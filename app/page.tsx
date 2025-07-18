import Calculator from "../calculator"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calculator",
  description: "A modern, animated calculator web application",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function Page() {
  return <Calculator />
}

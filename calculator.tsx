"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon, History, X, Percent, Divide, Minus, Plus, Equal } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Calculator() {
  const [displayValue, setDisplayValue] = useState("0")
  const [storedValue, setStoredValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [lastPressed, setLastPressed] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(true)
  const [memory, setMemory] = useState<number>(0)

  // Load history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("calculatorHistory")
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }

      const savedMemory = localStorage.getItem("calculatorMemory")
      if (savedMemory) {
        setMemory(Number.parseFloat(savedMemory))
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  // Save history to localStorage whenever it changes
  const saveHistoryToLocalStorage = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem("calculatorHistory", JSON.stringify(newHistory))
    } catch (error) {
      console.error("Error saving history to localStorage:", error)
    }
  }, [])

  // Save memory to localStorage whenever it changes
  const saveMemoryToLocalStorage = useCallback((newMemory: number) => {
    try {
      localStorage.setItem("calculatorMemory", newMemory.toString())
    } catch (error) {
      console.error("Error saving memory to localStorage:", error)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(Number.parseInt(e.key, 10))
      } else if (e.key === ".") {
        inputDot()
      } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
        performOperation(e.key)
      } else if (e.key === "Enter" || e.key === "=") {
        performEquals()
      } else if (e.key === "Escape") {
        clearAll()
      } else if (e.key === "Backspace") {
        clearLastChar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [displayValue, storedValue, operation, waitingForOperand])

  useEffect(() => {
    if (lastPressed) {
      const timer = setTimeout(() => {
        setLastPressed(null)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [lastPressed])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const clearAll = () => {
    setDisplayValue("0")
    setStoredValue(null)
    setOperation(null)
    setWaitingForOperand(true)
    setLastPressed("C")
  }

  const clearLastChar = () => {
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.substring(0, displayValue.length - 1))
    } else {
      setDisplayValue("0")
      setWaitingForOperand(true)
    }
    setLastPressed("⌫")
  }

  const inputDigit = (digit: number) => {
    if (waitingForOperand) {
      setDisplayValue(digit.toString())
      setWaitingForOperand(false)
    } else {
      setDisplayValue(displayValue === "0" ? digit.toString() : displayValue + digit.toString())
    }
    setLastPressed(digit.toString())
  }

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplayValue("0.")
      setWaitingForOperand(false)
    } else if (displayValue.indexOf(".") === -1) {
      setDisplayValue(displayValue + ".")
    }
    setLastPressed(".")
  }

  const toggleSign = () => {
    const value = Number.parseFloat(displayValue)
    setDisplayValue((-value).toString())
    setLastPressed("±")
  }

  const inputPercent = () => {
    const value = Number.parseFloat(displayValue)
    setDisplayValue((value / 100).toString())
    setLastPressed("%")
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = Number.parseFloat(displayValue)

    if (storedValue === null) {
      setStoredValue(inputValue)
    } else if (operation) {
      const currentValue = storedValue || 0
      const newValue = performCalculation(currentValue, inputValue, operation)

      setStoredValue(newValue)
      setDisplayValue(newValue.toString())

      // Add to history
      const newHistory = [...history, `${currentValue} ${operation} ${inputValue} = ${newValue}`]
      setHistory(newHistory)
      saveHistoryToLocalStorage(newHistory)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
    setLastPressed(nextOperation)
  }

  const performEquals = () => {
    const inputValue = Number.parseFloat(displayValue)

    if (storedValue !== null && operation) {
      const currentValue = storedValue || 0
      const newValue = performCalculation(currentValue, inputValue, operation)

      // Add to history
      const newHistory = [...history, `${currentValue} ${operation} ${inputValue} = ${newValue}`]
      setHistory(newHistory)
      saveHistoryToLocalStorage(newHistory)

      setDisplayValue(newValue.toString())
      setStoredValue(null)
      setOperation(null)
      setWaitingForOperand(true)
      setLastPressed("=")
    }
  }

  const performCalculation = (firstOperand: number, secondOperand: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstOperand + secondOperand
      case "-":
        return firstOperand - secondOperand
      case "*":
        return firstOperand * secondOperand
      case "/":
        return firstOperand / secondOperand
      case "x^y":
        return Math.pow(firstOperand, secondOperand)
      case "log":
        return Math.log(secondOperand) / Math.log(firstOperand)
      default:
        return secondOperand
    }
  }

  const calculateSquareRoot = () => {
    const value = Number.parseFloat(displayValue)
    const result = Math.sqrt(value)
    setDisplayValue(result.toString())
    setLastPressed("√")

    // Add to history
    const newHistory = [...history, `√(${value}) = ${result}`]
    setHistory(newHistory)
    saveHistoryToLocalStorage(newHistory)
  }

  const calculateSquare = () => {
    const value = Number.parseFloat(displayValue)
    const result = value * value
    setDisplayValue(result.toString())
    setLastPressed("x²")

    // Add to history
    const newHistory = [...history, `${value}² = ${result}`]
    setHistory(newHistory)
    saveHistoryToLocalStorage(newHistory)
  }

  const calculateReciprocal = () => {
    const value = Number.parseFloat(displayValue)
    const result = 1 / value
    setDisplayValue(result.toString())
    setLastPressed("1/x")

    // Add to history
    const newHistory = [...history, `1/${value} = ${result}`]
    setHistory(newHistory)
    saveHistoryToLocalStorage(newHistory)
  }

  const calculateSin = () => {
    const value = Number.parseFloat(displayValue)
    const result = Math.sin(value * (Math.PI / 180)) // Convert to radians
    setDisplayValue(result.toString())
    setLastPressed("sin")

    // Add to history
    const newHistory = [...history, `sin(${value}°) = ${result}`]
    setHistory(newHistory)
    saveHistoryToLocalStorage(newHistory)
  }

  const calculateCos = () => {
    const value = Number.parseFloat(displayValue)
    const result = Math.cos(value * (Math.PI / 180)) // Convert to radians
    setDisplayValue(result.toString())
    setLastPressed("cos")

    // Add to history
    const newHistory = [...history, `cos(${value}°) = ${result}`]
    setHistory(newHistory)
    saveHistoryToLocalStorage(newHistory)
  }

  const calculateTan = () => {
    const value = Number.parseFloat(displayValue)
    const result = Math.tan(value * (Math.PI / 180)) // Convert to radians
    setDisplayValue(result.toString())
    setLastPressed("tan")

    // Add to history
    const newHistory = [...history, `tan(${value}°) = ${result}`]
    setHistory(newHistory)
    saveHistoryToLocalStorage(newHistory)
  }

  const calculateLog = () => {
    const value = Number.parseFloat(displayValue)
    const result = Math.log10(value)
    setDisplayValue(result.toString())
    setLastPressed("log")

    // Add to history
    const newHistory = [...history, `log(${value}) = ${result}`]
    setHistory(newHistory)
    saveHistoryToLocalStorage(newHistory)
  }

  const calculateLn = () => {
    const value = Number.parseFloat(displayValue)
    const result = Math.log(value)
    setDisplayValue(result.toString())
    setLastPressed("ln")

    // Add to history
    const newHistory = [...history, `ln(${value}) = ${result}`]
    setHistory(newHistory)
    saveHistoryToLocalStorage(newHistory)
  }

  const memoryAdd = () => {
    const newMemory = memory + Number.parseFloat(displayValue)
    setMemory(newMemory)
    saveMemoryToLocalStorage(newMemory)
    setWaitingForOperand(true)
    setLastPressed("M+")
  }

  const memorySubtract = () => {
    const newMemory = memory - Number.parseFloat(displayValue)
    setMemory(newMemory)
    saveMemoryToLocalStorage(newMemory)
    setWaitingForOperand(true)
    setLastPressed("M-")
  }

  const memoryRecall = () => {
    setDisplayValue(memory.toString())
    setWaitingForOperand(false)
    setLastPressed("MR")
  }

  const memoryClear = () => {
    setMemory(0)
    saveMemoryToLocalStorage(0)
    setLastPressed("MC")
  }

  const clearHistory = () => {
    setHistory([])
    saveHistoryToLocalStorage([])
  }

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        isDarkMode ? "dark bg-gray-900" : "bg-gray-100",
      )}
    >
      <div className="w-full max-w-md">
        <motion.div
          className={cn(
            "backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl",
            isDarkMode
              ? "bg-gray-800/80 text-white border border-gray-700"
              : "bg-white/80 text-gray-800 border border-gray-200",
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <History size={20} />
            </motion.button>
            <h1 className="text-lg font-medium">Calculator</h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>

          {/* Display */}
          <div className="p-4 text-right">
            <div className="text-gray-500 dark:text-gray-400 text-sm h-6">
              {storedValue !== null && `${storedValue} ${operation}`}
            </div>
            <motion.div
              key={displayValue}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-light tracking-tight overflow-x-auto scrollbar-hide"
            >
              {displayValue}
            </motion.div>
          </div>

          {/* History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4 max-h-60 overflow-y-auto">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">History</h3>
                    <button onClick={clearHistory} className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
                      Clear
                    </button>
                  </div>
                  {history.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No history yet</p>
                  ) : (
                    <ul className="space-y-1">
                      {history.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="text-sm text-gray-600 dark:text-gray-300"
                        >
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Memory Display */}
          <div className="px-4 py-2 flex justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            <span>Memory: {memory}</span>
            <span>{operation && `Operation: ${operation}`}</span>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-1 p-2">
            {/* Memory Row */}
            <CalcButton onClick={memoryClear} label="MC" type="memory" lastPressed={lastPressed} />
            <CalcButton onClick={memoryRecall} label="MR" type="memory" lastPressed={lastPressed} />
            <CalcButton onClick={memoryAdd} label="M+" type="memory" lastPressed={lastPressed} />
            <CalcButton onClick={memorySubtract} label="M-" type="memory" lastPressed={lastPressed} />

            {/* Scientific Row */}
            <CalcButton onClick={calculateSin} label="sin" type="function" lastPressed={lastPressed} />
            <CalcButton onClick={calculateCos} label="cos" type="function" lastPressed={lastPressed} />
            <CalcButton onClick={calculateTan} label="tan" type="function" lastPressed={lastPressed} />
            <CalcButton onClick={() => performOperation("x^y")} label="x^y" type="function" lastPressed={lastPressed} />

            {/* More Scientific */}
            <CalcButton onClick={calculateLog} label="log" type="function" lastPressed={lastPressed} />
            <CalcButton onClick={calculateLn} label="ln" type="function" lastPressed={lastPressed} />
            <CalcButton onClick={calculateSquareRoot} label="√" type="function" lastPressed={lastPressed} />
            <CalcButton onClick={calculateSquare} label="x²" type="function" lastPressed={lastPressed} />

            {/* First Row */}
            <CalcButton onClick={clearAll} label="C" type="function" lastPressed={lastPressed} />
            <CalcButton onClick={toggleSign} label="±" type="function" lastPressed={lastPressed} />
            <CalcButton
              onClick={inputPercent}
              label="%"
              type="function"
              lastPressed={lastPressed}
              icon={<Percent size={18} />}
            />
            <CalcButton
              onClick={() => performOperation("/")}
              label="÷"
              type="operation"
              lastPressed={lastPressed}
              icon={<Divide size={18} />}
            />

            {/* Second Row */}
            <CalcButton onClick={() => inputDigit(7)} label="7" type="digit" lastPressed={lastPressed} />
            <CalcButton onClick={() => inputDigit(8)} label="8" type="digit" lastPressed={lastPressed} />
            <CalcButton onClick={() => inputDigit(9)} label="9" type="digit" lastPressed={lastPressed} />
            <CalcButton
              onClick={() => performOperation("*")}
              label="×"
              type="operation"
              lastPressed={lastPressed}
              icon={<X size={18} />}
            />

            {/* Third Row */}
            <CalcButton onClick={() => inputDigit(4)} label="4" type="digit" lastPressed={lastPressed} />
            <CalcButton onClick={() => inputDigit(5)} label="5" type="digit" lastPressed={lastPressed} />
            <CalcButton onClick={() => inputDigit(6)} label="6" type="digit" lastPressed={lastPressed} />
            <CalcButton
              onClick={() => performOperation("-")}
              label="-"
              type="operation"
              lastPressed={lastPressed}
              icon={<Minus size={18} />}
            />

            {/* Fourth Row */}
            <CalcButton onClick={() => inputDigit(1)} label="1" type="digit" lastPressed={lastPressed} />
            <CalcButton onClick={() => inputDigit(2)} label="2" type="digit" lastPressed={lastPressed} />
            <CalcButton onClick={() => inputDigit(3)} label="3" type="digit" lastPressed={lastPressed} />
            <CalcButton
              onClick={() => performOperation("+")}
              label="+"
              type="operation"
              lastPressed={lastPressed}
              icon={<Plus size={18} />}
            />

            {/* Fifth Row */}
            <CalcButton onClick={calculateReciprocal} label="1/x" type="function" lastPressed={lastPressed} />
            <CalcButton onClick={() => inputDigit(0)} label="0" type="digit" lastPressed={lastPressed} />
            <CalcButton onClick={inputDot} label="." type="digit" lastPressed={lastPressed} />
            <CalcButton
              onClick={performEquals}
              label="="
              type="equals"
              lastPressed={lastPressed}
              icon={<Equal size={18} />}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface CalcButtonProps {
  onClick: () => void
  label: string
  type: "digit" | "operation" | "function" | "equals" | "memory"
  lastPressed: string | null
  icon?: React.ReactNode
}

const CalcButton: React.FC<CalcButtonProps> = ({ onClick, label, type, lastPressed, icon }) => {
  const isActive = lastPressed === label

  const getButtonStyle = () => {
    switch (type) {
      case "digit":
        return "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
      case "operation":
        return "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
      case "equals":
        return "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
      case "function":
        return "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
      case "memory":
        return "bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300"
      default:
        return "bg-gray-100 dark:bg-gray-700"
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(
        "rounded-xl h-14 flex items-center justify-center font-medium transition-colors",
        getButtonStyle(),
        isActive && "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800",
      )}
      onClick={onClick}
    >
      {icon || label}
    </motion.button>
  )
}

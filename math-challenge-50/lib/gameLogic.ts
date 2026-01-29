// Game logic for 50-mas calculation

export type Operation = '+' | '-' | '*' | 'mixed'

export interface Question {
  row: number
  col: number
  value: number
  operation: Operation
}

export interface GameState {
  questions: Question[]
  answers: (number | null)[]
  startTime: number | null
  currentIndex: number
}

export function generateQuestions(level: number, cellCount: number = 50): Question[] {
  const questions: Question[] = []

  // Determine operation for each level
  // Level 1: all addition
  // Level 2: all subtraction
  // Level 3: all multiplication
  // Level 4: mixed (random per cell)

  // Calculate grid dimensions based on cell count
  // Try to make it as square as possible
  const cols = Math.ceil(Math.sqrt(cellCount))
  const rows = Math.ceil(cellCount / cols)
  const actualCellCount = rows * cols

  // Generate questions based on calculated grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Stop if we've reached the desired cell count
      if (questions.length >= cellCount) break

      let operation: Operation

      if (level === 4) {
        // Level 4: random operation per cell
        const ops: Operation[] = ['+', '-', '*']
        operation = ops[Math.floor(Math.random() * ops.length)]
      } else {
        // Levels 1-3: same operation for all cells
        switch (level) {
          case 1:
            operation = '+'
            break
          case 2:
            operation = '-'
            break
          case 3:
            operation = '*'
            break
          default:
            operation = '+'
        }
      }

      questions.push({
        row,
        col,
        value: 0, // Not used in standard 50-mas calculation
        operation,
      })
    }
    if (questions.length >= cellCount) break
  }

  return questions
}

export function calculateAnswer(
  rowValue: number,
  colValue: number,
  question: Question
): number {
  switch (question.operation) {
    case '+':
      return rowValue + colValue
    case '-':
      // Ensure non-negative result
      return Math.max(0, rowValue - colValue)
    case '*':
      return rowValue * colValue
    default:
      return rowValue + colValue
  }
}

export function generateRowValues(level: number, rowCount: number = 10): number[] {
  const values: number[] = []
  const usedValues = new Set<number>()
  
  for (let i = 0; i < rowCount; i++) {
    let value: number
    let attempts = 0
    const maxAttempts = 100
    
    do {
      if (level === 1) {
        // Level 1: 1-9, no duplicates
        value = Math.floor(Math.random() * 9) + 1
      } else if (level === 3) {
        // Level 3: 1-9 for multiplication, no duplicates
        value = Math.floor(Math.random() * 9) + 1
      } else {
        // Level 2, 4: 1-99, no duplicates
        value = Math.floor(Math.random() * 99) + 1
      }
      attempts++
    } while (usedValues.has(value) && attempts < maxAttempts)
    
    values.push(value)
    usedValues.add(value)
  }
  
  return values
}

export function generateColValues(level: number, colCount: number = 5, rowValues?: number[]): number[] {
  const values: number[] = []
  const usedValues = new Set<number>()
  
  for (let i = 0; i < colCount; i++) {
    let value: number
    let attempts = 0
    const maxAttempts = 100
    
    do {
      if (level === 1) {
        // Level 1: 1-9, no duplicates
        value = Math.floor(Math.random() * 9) + 1
      } else if (level === 2) {
        // For subtraction, ensure column values are smaller than row values
        // Generate values that will result in non-negative answers
        const maxRowValue = rowValues ? Math.max(...rowValues) : 99
        value = Math.floor(Math.random() * Math.min(maxRowValue, 50)) + 1
      } else if (level === 3) {
        // Level 3: 1-9 for multiplication, no duplicates
        value = Math.floor(Math.random() * 9) + 1
      } else {
        // Level 4: 1-99, no duplicates
        value = Math.floor(Math.random() * 99) + 1
      }
      attempts++
    } while (usedValues.has(value) && attempts < maxAttempts)
    
    values.push(value)
    usedValues.add(value)
  }
  
  return values
}

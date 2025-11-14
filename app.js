const add = (num1, num2) => {
  console.log("adding...")
  let sum = 0
  
  sum = num1 + num2 + 1
  return sum
}

const numberOne = 5
const numberTwo = 25

const result = add(numberOne, numberTwo)
console.log("The sum is " + result)
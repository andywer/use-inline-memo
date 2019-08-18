import * as React from "react"

function doSelectorsMatch(expected: any[], actual: any[]) {
  if (expected.length !== actual.length) {
    // tslint:disable-next-line no-console
    console.error("Memo selectors array's length is not supposed to change between calls.")
    return false
  }

  for (let index = 0; index < expected.length; index++) {
    if (actual[index] !== expected[index]) {
      return false
    }
  }
  return true
}

const createMap = () => new Map<number, [any[], any]>()

export default function useInlineMemo() {
  let callerCounter = 1
  const memos = React.useMemo(createMap, [])

  return function memo<T>(value: T, selectors: any[]): T {
    const callerID = callerCounter++
    const prevMemoItem = memos.get(callerID)

    if (!prevMemoItem && !selectors) {
      throw Error("No memo selectors passed. Pass selectors as 2nd argument.")
    }
    if (!prevMemoItem && !Array.isArray(selectors)) {
      throw Error("Memo selectors must be an array.")
    }

    const needToUpdate = !prevMemoItem || !doSelectorsMatch(prevMemoItem[0], selectors)

    if (needToUpdate) {
      memos.set(callerID, [selectors, value])
    }
    return prevMemoItem ? prevMemoItem[1] : value
  }
}

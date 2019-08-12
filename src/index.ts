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

export default function useInlineMemo() {
  const memos = React.useMemo(() => new Map<string, [any[], any]>(), [])

  return function memo<T>(value: T, selectors: any[]): T {
    // Quick & dirty way to match the memo() call to previous calls
    const callerID = (new Error("-")).stack!.split("\n")[1]
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

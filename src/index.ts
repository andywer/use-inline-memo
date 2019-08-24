import * as React from "react"

type MemoFunction = <T>(value: T, deps: any[]) => T

type MapToMemoizers<Key extends string> = {
  [key in Key]: MemoFunction
}

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

function createMemoizerFunction(callerID: string, memoized: Map<string, [any[], any]>) {
  return function memo<T>(value: T, selectors: any[]): T {
    const prevMemoItem = memoized.get(callerID)

    if (!prevMemoItem && !selectors) {
      throw Error("No memo selectors passed. Pass selectors as 2nd argument.")
    }
    if (!prevMemoItem && !Array.isArray(selectors)) {
      throw Error("Memo selectors must be an array.")
    }

    const needToUpdate = !prevMemoItem || !doSelectorsMatch(prevMemoItem[0], selectors)

    if (needToUpdate) {
      memoized.set(callerID, [selectors, value])
    }

    return prevMemoItem ? prevMemoItem[1] : value
  }
}

function createMemoObjectWithKeys<Key extends string>(
  identifiers: Key[],
  memoized: Map<Key, [any[], any]>
): MapToMemoizers<Key> {
  const memo = {} as MapToMemoizers<Key>

  for (const identifier of identifiers) {
    memo[identifier] = createMemoizerFunction(identifier as string, memoized as Map<string, any>)
  }

  return memo
}

function createMemoProxyObject<Key extends string>(
  memoized: Map<Key, [any[], any]>
): MapToMemoizers<Key> {
  if (typeof Proxy === "undefined") {
    throw Error(
      "The JavaScript runtime does not support ES2015 Proxy objects.\n" +
      "Please call the hook with explicit property keys, like this:\n" +
      "  useInlineMemo(\"key1\", \"key2\")"
    )
  }

  return new Proxy({} as MapToMemoizers<Key>, {
    get(target, property) {
      const identifier = property as Key
      const initializedProp = target[identifier]

      if (initializedProp) {
        return initializedProp
      } else {
        const memoizer = createMemoizerFunction(identifier, memoized)
        target[identifier] = memoizer
        return memoizer
      }
    }
  })
}

export default function useInlineMemo<Key extends string>(): MapToMemoizers<Key>
export default function useInlineMemo<Key extends string>(...identifiers: Key[]): MapToMemoizers<Key>
export default function useInlineMemo<Key extends string>(...identifiers: Key[]): MapToMemoizers<Key> {
  const memoObjectRef = React.useRef<MapToMemoizers<Key> | null>(null)
  const memoized = React.useMemo(() => new Map<string, [any[], any]>(), [])

  if (!memoObjectRef.current && identifiers.length > 0) {
    memoObjectRef.current = createMemoObjectWithKeys(identifiers, memoized)
  } else if (!memoObjectRef.current) {
    memoObjectRef.current = createMemoProxyObject(memoized)
  }

  return memoObjectRef.current
}

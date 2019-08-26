import * as React from "react"

const $calls = Symbol("calls")
const inProduction = typeof process !== "undefined" && process.env && process.env.NODE_ENV === "production"

type MemoFunction = <T>(value: T, deps: any[]) => T

type MapToMemoizers<Key extends string> = {
  [key in Key]: MemoFunction
} & {
  [$calls]: Set<Key>
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

function createMemoizerFunction(
  callerID: string,
  memoized: Map<string, [any[], any]>,
  getCalls: () => Set<string>
) {
  return function memo<T>(value: T, selectors: any[]): T {
    const calls = getCalls()
    const prevMemoItem = memoized.get(callerID)

    if (!prevMemoItem && !selectors) {
      throw Error("No memo selectors passed. Pass selectors as 2nd argument.")
    }
    if (!prevMemoItem && !Array.isArray(selectors)) {
      throw Error("Memo selectors must be an array.")
    }
    if (!inProduction && calls.has(callerID)) {
      throw Error(
        `Inline memoizer memo.${callerID}() called twice during one render. ` +
        `This is usually a mistake, probably caused by copy & paste.`
      )
    }

    const needToUpdate = !prevMemoItem || !doSelectorsMatch(prevMemoItem[0], selectors)

    if (needToUpdate) {
      memoized.set(callerID, [selectors, value])
    }
    if (!inProduction) {
      calls.add(callerID)
    }

    return prevMemoItem ? prevMemoItem[1] : value
  }
}

function createMemoObjectWithKeys<Key extends string>(
  identifiers: Key[],
  memoized: Map<Key, [any[], any]>
): MapToMemoizers<Key> {
  const memo = {} as MapToMemoizers<Key>
  const getCalls = () => memo[$calls]

  for (const identifier of identifiers) {
    memo[identifier] = createMemoizerFunction(identifier, memoized, getCalls) as any
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

  const memo = {} as MapToMemoizers<Key>
  const getCalls = () => memo[$calls]

  return new Proxy(memo, {
    get(target, property) {
      const identifier = property as Key
      const initializedProp = target[identifier]

      if (initializedProp) {
        return initializedProp
      } else {
        const memoizer = createMemoizerFunction(identifier, memoized, getCalls)
        target[identifier] = memoizer as any
        return memoizer
      }
    }
  })
}

export default function useInlineMemo<Key extends string>(): MapToMemoizers<Key>
export default function useInlineMemo<Key extends string>(...identifiers: Key[]): MapToMemoizers<Key>
export default function useInlineMemo<Key extends string>(...identifiers: Key[]): MapToMemoizers<Key> {
  const memoized = React.useMemo(() => new Map<Key, [any[], any]>(), [])

  const memoObject = React.useMemo(() => {
    if (identifiers.length > 0) {
      return createMemoObjectWithKeys(identifiers, memoized)
    } else {
      return createMemoProxyObject(memoized)
    }
  }, [])

  // Re-init the calls every time useInlineMemo() is called
  memoObject[$calls] = new Set()

  return memoObject
}

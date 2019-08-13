<h1 align="center">⚛︎ use-inline-memo</h1>

<p align="center">
  <b>React hook for memoizing values inline anywhere in a component.</b>
</p>

<p align="center">
  <a href="https://travis-ci.org/andywer/use-inline-memo"><img alt="Build status" src="https://travis-ci.org/andywer/use-inline-memo.svg?branch=master" /></a>
  <a href="https://www.npmjs.com/package/use-inline-memo"><img alt="npm version" src="https://img.shields.io/npm/v/use-inline-memo.svg" /></a>
</p>

<br />

Like other hooks, you can call [`React.useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo) and [`React.useCallback()`](https://reactjs.org/docs/hooks-reference.html#usecallback) only at the top of your component function and not use them conditionally.

Inline memos let us memoize anywhere without the restrictions that apply to the usage of hooks!

```jsx
import { Button, TextField } from "@material-ui/core"
import React from "react"
import useInlineMemo from "use-inline-memo"

function NameForm(props) {
  const memo = useInlineMemo()
  const [newName, setNewName] = React.useState(props.prevName)

  // Conditional return prevents calling any hook after this line
  if (props.disabled) {
    return <div>(Disabled)</div>
  }

  return (
    <React.Fragment>
      <TextField
        label="Name"
        onChange={memo(event => setNewName(event.target.value), [])}
        value={newName}
      />
      <Button
        onClick={memo(() => props.onSubmit(newName), [newName])}
        style={memo({ margin: "16px auto 0" }, [])}
      >
        Submit
      </Button>
    </React.Fragment>
  )
}
```

## Installation

```
npm install use-inline-memo
```

## Use cases

### Event listeners

Inline memoizers are perfect to define simple one-line callbacks in-place in the JSX without sacrificing performance.

```jsx
// Before
function Component() {
  const [value, setValue] = React.useState("")
  const onUserInput = React.useCallback(
    (event: React.SyntheticEvent) => setValue(event.target.value),
    []
  )
  return (
    <input onChange={onUserInput} value={value} />
  )
}
```

```jsx
// After
function Component() {
  const memo = useInlineMemo()
  const [value, setValue] = React.useState("")
  return (
    <input
      onChange={memo(event => setValue(event.target.value), [])}
      value={value}
    />
  )
}
```

### `style` props & other objects

Using inline style props is oftentimes an express ticket to unnecessary re-renderings as you will create a new style object on each rendering, even though its content will in many cases never change.

```jsx
// Before
function Component() {
  return (
    <Button style={{ color: "red" }} type="submit">
      Delete
    </Button>
  )
}
```

```jsx
// After
function Component() {
  const memo = useInlineMemo()
  return (
    <Button style={memo({ color: "red" }, [])} type="submit">
      Delete
    </Button>
  )
}
```

You don't need to memoize every style object of every single DOM element, though. Use it whenever you pass an object to a complex component which is expensive to re-render.

For more background information check out [FAQs: Why memoize objects?](#faqs).

## API

#### `useInlineMemo(): MemoFunction`

Call it once in a component to obtain the `memo()` function.

#### `memo(value: T, deps: any[]): T`

Works the same as a call to `React.useMemo()` or `React.useCallback()`, only without the wrapping callback function. That wrapping function is useful to run expensive instantiations only if we actually refresh the value, but for our use case this is rather unlikely, so we provide you with a more convenient API instead.

## FAQs

<details>
<summary>How does that work?</summary>

The reason why React hooks cannot be called arbitrarily is that React needs to match the current hook call to previous calls. The only way it can match them is by assuming that the same hooks will always be called in the same order.

So what we do here is to provide a hook `useInlineMemo()` that creates a `Map` to match `memo()` calls to the memoized value and the deps array. We can match calls to `memo()`, even conditional calls, between different re-renderings by using the call site (the location where `memo()` was called) as an identifier.

We obtain the call site in a lean and fast way. We create a new `Error` instance to get a stack trace, then we take the second-to-top location from the stack trace.
</details>

<details>
<summary>Why is memoization so important?</summary>

To ensure good performance you want to re-render as few components as possible if some application state changes. In React we use `React.memo()` for that which judges by comparing the current component props to the props of the previous rendering.

Without memoization we will very often create the same objects, callbacks, ... with the same content over and over again for each rendering, but as they are new instances every time, they will not be recognized as the same values and cause unnecessary re-renderings (see "Why memoize objects?" below).
</details>

<details>
<summary>Why memoize objects?</summary>

When `React.memo()` determines whether a component needs to be re-rendered, it tests if the property values are equivalent to the property values of the last rendering. It does though by comparing them for equality by reference, as anything else would take too much time.

Now if the parent component creates a new object and passes it to the component as a property, React will only check if the object is exactly the same object instance as for the last rendering (`newObject === prevObject`). Even if the object has exactly the same properties as before, with the exact same values, it will nevertheless be a new object that just happens to have the same content.

Without memoization `React.memo()` will always re-render the component as we keep passing new object instances – the equality comparison of the old and the new property value will never be true. Memoization makes sure to re-use the actual last object instance, thus skipping re-rendering.
</details>

## License

MIT

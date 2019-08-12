<h1 align="center">⚛︎ use-inline-memo</h1>

<p align="center">
  <b>React hook for memoizing values inline at any place in a component.</b>
</p>

<br />

Like other hooks, you can call [`React.useMemo()`](https://reactjs.org/docs/hooks-reference.html#usememo) and [`React.useCallback()`](https://reactjs.org/docs/hooks-reference.html#usecallback) only at the top of your component function and not use them conditionally.

Let's fix that!

```jsx
import { Button, TextField } from "@material-ui/core"
import React from "react"
import useInlineMemo from "use-inline-memo"

function NameForm(props) {
  const memo = useInlineMemo()
  const [newName, setNewName] = React.useState(props.prevName)
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
  const [value, setValue] = React.useState("")
  return (
    <input
      onChange={memo(event => setValue(event.target.value), [])}
      value={value}
    />
  )
}
```

### `style` props

Using inline style props is oftentimes an express ticket to unnecessary re-renderings as you will create a new style object on each rendering, even though its content will in many cases never change.

This can now be fixed easily.

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

To ensure good performance you want to re-render as components as possible if some application state changes. In React we use `React.memo()` for that which judges by comparing the current component props to the props of the previous rendering.

Without memoization we will very often create the same objects, callbacks, ... with the same content over and over again for each rendering, but as new instantiations, which will not be recognized as the same props and cause unnecessary re-renderings.
</details>

## License

MIT

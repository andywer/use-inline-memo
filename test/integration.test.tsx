import test from "ava"
import * as React from "react"
import useInlineMemo from "../src/index"
import render from "./_helpers/render"
import RenderCounter from "./_helpers/RenderCounter"

test("can memo inline styles", async t => {
  const counter = { count: 0 }

  const StyledComponent = React.memo((props: { style: React.CSSProperties }) => {
    return (
      <RenderCounter counter={counter}>
        <div style={props.style}></div>
      </RenderCounter>
    )
  })
  const StylingComponent = React.memo((props: { color: string }) => {
    const memo = useInlineMemo()
    return (
      <StyledComponent style={memo({ color: props.color }, [props.color])} />
    )
  })

  await render(["red", "red", "green", "red", "green"], color => (
    <StylingComponent color={color} />
  ))

  t.is(counter.count, 3, "Should render 3x, not 5x as without memo()-ing.")
})

test("can memo event listeners", async t => {
  const counter = { count: 0 }

  const Button = React.memo((props: { children: React.ReactNode; onClick: () => void }) => {
    return (
      <RenderCounter counter={counter}>
        <button onClick={props.onClick}>{props.children}</button>
      </RenderCounter>
    )
  })
  const Sample = () => {
    const memo = useInlineMemo()
    return (
      <Button onClick={memo(() => window.alert("Clicked!"), [])}>
        Click me
      </Button>
    )
  }

  await render([1, 2, 3], () => (
    <Sample />
  ))

  t.is(counter.count, 1, "Should render 1x, not 3x as without memo()-ing.")
})

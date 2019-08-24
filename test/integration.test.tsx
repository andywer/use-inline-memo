import test from "ava"
import * as React from "react"
import useInlineMemo from "../src/index"
import render from "./_helpers/render"
import RenderCounter from "./_helpers/RenderCounter"

const benchmarkMessages: string[] = []

function benchmark<Props>(label: string, Component: React.FunctionComponent<Props>) {
  return (props: Props) => {
    const startTime = process.hrtime.bigint()
    const rendered = Component(props)
    const measuredTime = process.hrtime.bigint() - startTime
    benchmarkMessages.push(`${label} rendering took ${(Number(measuredTime) / 1e6).toFixed(3)}ms`)
    return rendered
  }
}

test.after(() => benchmarkMessages.forEach(message => console.log(message)))

test("can memo inline styles", async t => {
  const counter = { count: 0 }

  const StyledComponent = React.memo((props: { style: React.CSSProperties }) => {
    return (
      <RenderCounter counter={counter}>
        <div style={props.style}></div>
      </RenderCounter>
    )
  })
  const StylingComponent = React.memo(benchmark(t.title, (props: { color: string }) => {
    const memo = useInlineMemo()
    return (
      <StyledComponent style={memo.style({ color: props.color }, [props.color])} />
    )
  }))

  await render(["red", "red", "green", "red", "green"], color => (
    <StylingComponent color={color} />
  ))

  t.is(counter.count, 3, "Should render 3x, not 5x as without memo()-ing.")
})

test("can memo inline styles with explicit memo identifiers", async t => {
  const counter = { count: 0 }

  const StyledComponent = React.memo((props: { style: React.CSSProperties }) => {
    return (
      <RenderCounter counter={counter}>
        <div style={props.style}></div>
      </RenderCounter>
    )
  })
  const StylingComponent = React.memo(benchmark(t.title, (props: { color: string }) => {
    const memo = useInlineMemo("style")
    return (
      <StyledComponent style={memo.style({ color: props.color }, [props.color])} />
    )
  }))

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
  const Sample = benchmark(t.title, () => {
    const memo = useInlineMemo()
    return (
      <Button onClick={memo.click(() => window.alert("Clicked!"), [])}>
        Click me
      </Button>
    )
  })

  await render([1, 2, 3], () => (
    <Sample />
  ))

  t.is(counter.count, 1, "Should render 1x, not 3x as without memo()-ing.")
})

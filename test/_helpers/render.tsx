import { JSDOM } from "jsdom"
import * as React from "react"
import * as ReactDOM from "react-dom"
import StateProvider from "./StateProvider"

const dom = new JSDOM()
;(global as any).window = dom.window

export default function render<State>(states: State[], renderFn: (state: State) => React.ReactElement) {
  const mountPoint = dom.window.document.createElement("div")
  dom.window.document.body.appendChild(mountPoint)

  return new Promise(resolve => {
    ReactDOM.render(
      <StateProvider onCompletion={resolve} states={states}>
        {renderFn}
      </StateProvider>,
      mountPoint
    )
  })
}

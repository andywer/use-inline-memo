import * as React from "react"

interface Props<State> {
  children: (currentState: State) => React.ReactElement
  onCompletion?: () => void
  states: State[]
}

const StateProvider = <State>(props: Props<State>) => {
  const { onCompletion = () => undefined } = props

  const [stateIndex, setStateIndex] = React.useState(0)
  const currentState = props.states[stateIndex]

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStateIndex(prevIndex => {
        if (prevIndex < props.states.length - 1) {
          return prevIndex + 1
        } else {
          clearInterval(interval)
          setTimeout(() => onCompletion(), 50)
          return prevIndex
        }
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return props.children(currentState)
}

export default StateProvider

import Color from "https://colorjs.io/dist/color.js"

const state = {
  l: 0.5,
  a: 0,
  b: 0,
}

const config = { 
  lUI: 100, 
  abUI: 1000, 

  lStep: 0.01, 
  abStep: 0.001,

  lMin: 0,
  lMax: 1,
  abMin: -0.25,
  abMax: 0.25,
}

const themeStates = {
  light: "light",
  dark: "dark"
}

const bodyState = {
  isDarkTheme: "is-dark-theme"
}

const documentElement = window.document
const inputElements = documentElement.querySelectorAll("input[type=number]")
const rangeElements = documentElement.querySelectorAll("input[type=range]")

const colorPreviewElement  = documentElement.querySelector("[data-js-color-preview]")
const colorHexForm = documentElement.querySelector("[data-js-color-hex-form]")
const colorOKLabForm = documentElement.querySelector("[data-js-color-oklab-form]")

let lastColor = colorHexForm.value

const lCounterElement = documentElement.querySelector("[data-js-l-counter]")
const aCounterElement = documentElement.querySelector("[data-js-a-counter]")
const bCounterElement = documentElement.querySelector("[data-js-b-counter]")

const lRangeElement = documentElement.querySelector("[data-js-l-range]")
const aRangeElement = documentElement.querySelector("[data-js-a-range]")
const bRangeElement = documentElement.querySelector("[data-js-b-range]")

const buttonPlusElements  = documentElement.querySelectorAll("[data-js-button-plus]")
const buttonMinusElements = documentElement.querySelectorAll("[data-js-button-minus]")

const errorMessageElement = documentElement.querySelector("[data-js-error-message]")

const hideTimeouts = new Map()

const buttonCopyElements  = documentElement.querySelectorAll("[data-js-button-copy]")
const buttonPasteElement = documentElement.querySelector("[data-js-button-paste]")

const buttonThemeSwitch = documentElement.querySelector("[data-js-theme-switch]")
const moonIconElement = documentElement.querySelector("[data-js-moon-icon]")
const sunIconElement = documentElement.querySelector("[data-js-sun-icon]")
const raysIconElement = documentElement.querySelector("[data-js-rays-icon]")

function updateValuesElements() {
  const {l, a, b} = state
  const {lUI, abUI} = config
  const labCssForm = `oklab(${l} ${a} ${b})`
  const color = new Color("oklab", [l, a, b])

  colorPreviewElement.style.backgroundColor = labCssForm
  colorHexForm.value = color.to("srgb").toString({ format: "hex" })
  colorOKLabForm.value = `${l} ${a} ${b}`

  lCounterElement.value = Math.round(l * lUI)
  aCounterElement.value = Math.round(a * abUI)
  bCounterElement.value = Math.round(b * abUI)

  lRangeElement.value = l
  aRangeElement.value = a
  bRangeElement.value = b

  lastColor = colorHexForm.value
}

function isElementCorrect(element, number, permit = true) {
  const {name, value, min, max} = element

  const valueNum = Number(value) / number
  const minNum = Number(min)
  const maxNum = Number(max)

  if (state[name] !== undefined) {
    state[name] = clamp(valueNum, minNum, maxNum)
  }

  if (permit) {
    render()
  }
}

function clamp(value, min, max) {
  return value > max ? max : value < min ? min : value
}

function changeValue(button, delta, number) {
  const { name } = button

  const minNum = Number(button.dataset.min)
  const maxNum = Number(button.dataset.max)

  if (state[name] !== undefined) {
    state[name] = Math.round(clamp(state[name] + delta, minNum, maxNum) * number) / number
  }

  render()
}

function changeRagneGradient() {
  lRangeElement.style.setProperty("background", `linear-gradient(
    to right,
    oklab(0 ${state.a} ${state.b}) 0%, 
    oklab(1 ${state.a} ${state.b}) 100%
  )`)

  aRangeElement.style.setProperty("background", `linear-gradient(
    to right,
    oklab(${state.l} -0.25 ${state.b}) 0%, 
    oklab(${state.l}     0 ${state.b}) 50%,
    oklab(${state.l}  0.25 ${state.b}) 100%
  )`)

  bRangeElement.style.setProperty("background", `linear-gradient(
    to right,
    oklab(${state.l} ${state.a} -0.25) 0%, 
    oklab(${state.l} ${state.a}     0) 50%,
    oklab(${state.l} ${state.a}  0.25) 100%
  )`)
}

function showThenHideElement(element, time) {
  showElement(element)

  clearTimeout(hideTimeouts.get(element))

  hideTimeouts.set(element, setTimeout(() => hideElement(element), time))
}

function hideThenShowElement(element, time) {
  hideElement(element)

  clearTimeout(hideTimeouts.get(element))

  hideTimeouts.set(element, setTimeout(() => showElement(element), time))
}

function showElement(element) {
  element.classList.add("visible")
  element.classList.remove("hidden")
}

function hideElement(element) {
  element.classList.remove("visible")
  element.classList.add("hidden")
}

function isColorCorrect(color, element) {
  let localColor

  try{
    localColor = new Color(color).to("oklab")
  
    lastColor = color

    colorHexForm.value = color
  } catch {
    errorMessageElement.textContent = "Wrong value, try again."

    localColor = new Color(lastColor).to("oklab")

    colorHexForm.value = lastColor

    showThenHideElement(element, 3000)
  }

  state.l = Number(localColor.coords[0].toFixed(2))
  state.a = Number(localColor.coords[1].toFixed(3))
  state.b = Number(localColor.coords[2].toFixed(3))
  
  render()
}

function darckTheme() {
  moonIconElement.classList.add("visible")
  moonIconElement.classList.remove("hidden")

  sunIconElement.classList.remove("visible")
  sunIconElement.classList.add("hidden")

  raysIconElement.classList.remove("visible")
  raysIconElement.classList.add("hidden")
}

function theme() {
  if (localStorage.getItem("theme") === null) {
    localStorage.setItem("theme", `${themeStates.light}`)
  } else if (localStorage.getItem("theme") === themeStates.dark) {
    documentElement.body.classList.add(`${bodyState.isDarkTheme}`)
  } else {
    documentElement.body.classList.remove(`${bodyState.isDarkTheme}`)
  }
}

function updateUrl() {
  const {l, a, b} = state

  location.hash = `l=${l}&a=${a}&b=${b}`
}

function render() {
  updateValuesElements()
  changeRagneGradient()
  updateUrl()
}

function loadFromUrl() {
  const params = new URLSearchParams(location.hash.slice(1))

  state.l = Number(params.get("l"))
  state.a = Number(params.get("a"))
  state.b = Number(params.get("b"))

  render()
}

inputElements.forEach((input) => {
  input.addEventListener("change", (event) => {
    if (event.currentTarget.name === "l") {
      isElementCorrect(event.currentTarget, config.lUI)
    } else {
      isElementCorrect(event.currentTarget, config.abUI)
    }

    changeRagneGradient()
  })
})

rangeElements.forEach((range) => {
  range.addEventListener("input", (event) => {
    isElementCorrect(event.currentTarget, 1, false)
    
    updateValuesElements()
    changeRagneGradient()
  })
  range.addEventListener("change", () => {
    updateUrl()
  })
})

buttonPlusElements.forEach((button) => {
  button.addEventListener("click", (event) => {
    if (event.currentTarget.name === "l") {
      changeValue(event.currentTarget, +config.lStep, config.lUI)
    } else {
      changeValue(event.currentTarget, +config.abStep, config.abUI)
    }
  })
})

buttonMinusElements.forEach((button) => {
  button.addEventListener("click", (event) => {
    if (event.currentTarget.name === "l") {
      changeValue(event.currentTarget, -config.lStep, config.lUI)
    } else {
      changeValue(event.currentTarget, -config.abStep, config.abUI)
    }
  })
})

colorHexForm.addEventListener(("change"), () => {
  isColorCorrect(colorHexForm.value, errorMessageElement)
})

buttonPasteElement.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText()
    isColorCorrect(text, errorMessageElement)
  } catch {
    errorMessageElement.textContent = "Cannot paste value."
    showThenHideElement(errorMessageElement, 3000)
  }
})

buttonCopyElements.forEach((button) => {
  button.addEventListener("click", async (event) => {
    const buttonCopyIconElement  = event.currentTarget.querySelector("[data-js-button-copy-icon]")
    const buttonCopyDoneIconElement  = event.currentTarget.querySelector("[data-js-button-copy-done-icon]")

    try {
      await navigator.clipboard.writeText(colorHexForm.value)
      
      showThenHideElement(buttonCopyDoneIconElement, 1500)
      hideThenShowElement(buttonCopyIconElement, 1500)
    } catch {
      errorMessageElement.textContent = "Copy failed."
      showThenHideElement(errorMessageElement, 3000)
    }
  })
})

buttonThemeSwitch.addEventListener("click", () => {
  if (localStorage.getItem("theme") === themeStates.light) {
    localStorage.setItem("theme", `${themeStates.dark}`)

    theme()
  } else {
    localStorage.setItem("theme", `${themeStates.light}`)

    theme()
  }
})

colorOKLabForm.addEventListener("change", () => {
  const [l = 0, a = 0, b = 0] = colorOKLabForm.value.split(" ")
  const {lMin, lMax, abMin, abMax} = config

  state.l = l.length === 0 ? 0 : clamp(l, lMin, lMax)
  state.a = a.length === 0 ? 0 : clamp(a, abMin, abMax)
  state.b = b.length === 0 ? 0 : clamp(b, abMin, abMax)

  render()
})

render()
theme()
loadFromUrl()
export let CommonStyle = /* css */ `
.text-no-wrap {
  display: inline-block;
  width: max-content;
}
.text-center {
  text-align: center;
}

.d-flex {
  display: flex;
}
.flex-wrap {
  display: flex;
  flex-wrap: wrap;
}
.flex-grow {
  flex-grow: 1;
}
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.flex-column {
  flex-direction: column;
}

.inline-block {
  display: inline-block;
}

[hidden] {
  display: none !important;
}

img {
  max-width: 100%;
  max-height: 100%;
}

code.inline-code {
  background: rgba(175, 184, 193, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

.ws_status--safe-area {
  margin-top: 3rem;
}
`

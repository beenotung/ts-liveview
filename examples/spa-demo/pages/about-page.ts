export function renderAboutPage() {
  return `
<h2>About</h2>
<p>
This website is a
Server-Side Rendered Real-time Web App
(a.k.a. SSR <span hidden>Reactive</span> SPA)
.
</p>
<p>
When this url is loaded, the server response the complete html in the GET request.
This allows the browser to deliver a meaningful paint as soon as possible.
</p>
<p>
Then a websocket connection is established for each session.
</p>
<p>
The app logic is executed on the server, and the state is kept on the server.
</p>
<p>
The server maintains a "virtual dom", and send minimal diff patches for the client to apply partial page update (a.k.a. repaint).
</p>
<a href="#/editor">Try a reactive demo</a>
`
}

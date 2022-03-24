import express from 'express'

export function sendHTML(res: express.Response, html: string) {
  res.setHeader('Connection', 'Keep-Alive')
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  // res.setHeader('Link', `<http://localhost:8100/${page}>; rel="canonical"`)
  res.end(html)
}

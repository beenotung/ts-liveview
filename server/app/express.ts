import express from 'express'

export function sendHTMLHeader(res: express.Response) {
  res.setHeader('Connection', 'Keep-Alive')
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  // res.setHeader('Transfer-Encoding','chunked')
  // res.setHeader('Link', `<http://localhost:8100/${page}>; rel="canonical"`)
}

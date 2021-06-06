import express from 'express'

export function sendHTML(res: express.Response, html: string) {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Connection', 'Keep-Alive')
  res.end(html)
}
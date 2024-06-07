import express from 'express'

export function sendHTMLHeader(res: express.Response) {
  res.setHeader('Connection', 'Keep-Alive')
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  // res.setHeader('Transfer-Encoding','chunked')
  // res.setHeader('Link', `<http://localhost:8100/${page}>; rel="canonical"`)
}

export function setNoCache(res: express.Response) {
  res.removeHeader('ETag')
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, post-check=0, pre-check=0',
  )
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')
}

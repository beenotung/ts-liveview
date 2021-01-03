import { ViewRouter } from 'ts-liveview'
import type { AppSession } from './session'

export const router = new ViewRouter<AppSession>()
import './routes/home'
import './routes/profile'

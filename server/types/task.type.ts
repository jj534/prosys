import { Document } from 'mongoose'

export interface ITaskDocument extends Document {
  userId: string
  isComplete: boolean
  startTime: string
  endTime: string
  name: string
  due: Date | null
  notes: string
  isRecur: boolean
  provider?: 'google'
  providerTaskId?: string
  providerData?: any
}

export interface IScheduleTasks {
  [id: string]: ITaskDocument[]
}

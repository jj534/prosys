import React, { useEffect, useState, useRef } from 'react'

import { useUpdateInboxTaskById } from 'src/api/task'
import theme from 'src/app/theme'
import useIsMobile from 'src/hooks/useIsMobile'
import useKeypress from 'src/hooks/useKeyPress'
import { IInboxState, ITask } from 'src/types/task.type'
import { isTaskTimeSet } from 'src/util/task'
import styled from 'styled-components'
import Text from '../fonts/Text'
import OutsideClickListener from '../util/OutsideClickListener'

interface TaskTimeProps {
  task: ITask
  isFocused: boolean
  inboxState: IInboxState
  setInboxState: (state: IInboxState) => void
}

const TaskTime = ({ task, isFocused, inboxState, setInboxState }: TaskTimeProps) => {
  const { updateInboxTask } = useUpdateInboxTaskById(task?._id)
  const [localStartTime, setLocalStartTime] = useState<string>(task?.startTime)
  const [localEndTime, setLocalEndTime] = useState<string>(task?.endTime)
  const startTimeInputRef = useRef<HTMLInputElement>(null)
  const endTimeInputRef = useRef<HTMLInputElement>(null)

  const updateTime = () => {
    setInboxState('NAVIGATE')
    updateInboxTask({
      _id: task?._id,
      startTime: localStartTime,
      endTime: localEndTime,
    })
  }

  useKeypress(['t', 'ㅅ'], (event) => {
    if (isFocused) {
      if (inboxState === 'NAVIGATE') {
        event.preventDefault()
        setInboxState('EDIT_TIME')
        startTimeInputRef.current?.focus()
      } else if (inboxState === 'EDIT_TIME') {
        event.preventDefault()
        updateTime()
      }
    }
  })

  useKeypress(['Enter', 'Escape'], (event) => {
    if (isFocused && inboxState === 'EDIT_TIME') {
      event.preventDefault()
      updateTime()
    }
  })

  useKeypress('Tab', (event) => {
    if (isFocused && inboxState === 'EDIT_TIME') {
      event.preventDefault()
      if (document.activeElement === startTimeInputRef.current) {
        endTimeInputRef.current?.focus()
      } else {
        startTimeInputRef.current?.focus()
      }
    }
  })

  const incrementTimeStamp = (timeStamp: string) => {
    if (Number(timeStamp)) {
      return `0${(Number(timeStamp) + 100).toString()}`.slice(-4)
    }
    return '0000'
  }

  useEffect(() => {
    if (isFocused && inboxState === 'EDIT_TIME') {
      setLocalEndTime(incrementTimeStamp(localStartTime))
    }
  }, [localStartTime])

  // mobile
  const isMobile = useIsMobile()
  const [tempRender, setTempRender] = useState<boolean>(false)

  const handleTimeStampClick = (type: 'START' | 'END') => {
    if (isMobile && inboxState === 'NAVIGATE') {
      setInboxState('EDIT_TIME')

      if (type === 'START') {
        setTimeout(() => startTimeInputRef.current?.focus(), 0)
      } else if (type === 'END') {
        setTimeout(() => endTimeInputRef.current?.focus(), 0)
      }
    }
  }

  const handleOutsideClick = () => {
    if (isFocused && isMobile && inboxState === 'EDIT_TIME') {
      updateTime()
    }
  }

  const handleBlur = () => {
    if (isFocused && isMobile && inboxState === 'EDIT_TIME') {
      updateTime()
      setTempRender(true)
    }
  }

  useEffect(() => {
    if (tempRender) {
      setTimeout(() => setTempRender(false), 0)
    }
  }, [tempRender])

  const isSingleTimeStamp = localStartTime === localEndTime
  const isEditMode = (isFocused && inboxState === 'EDIT_TIME') || (isMobile && isFocused && tempRender)

  return (
    <OutsideClickListener
      onOutsideClick={handleOutsideClick}
      isListening
    >
      <div>
        {(isTaskTimeSet(task) || isEditMode) &&
          (
            <Container>
              <div onClick={() => handleTimeStampClick('START')}>
                <TimeStampInput
                  autoFocus
                  ref={startTimeInputRef}
                  value={localStartTime}
                  onChange={(e) => setLocalStartTime(e.target.value)}
                  onFocus={(event) => { if (!isMobile) event.target.select() }}
                  onBlur={handleBlur}
                  disabled={!isFocused || inboxState !== 'EDIT_TIME'}
                />
              </div>
              {(!isSingleTimeStamp || isEditMode) && (
                <>
                  <Text
                    variant='p'
                    nowrap
                    color={theme.text.light}
                  >-
                  </Text>
                  <div onClick={() => handleTimeStampClick('END')}>
                    <TimeStampInput
                      ref={endTimeInputRef}
                      value={localEndTime}
                      onChange={(event) => setLocalEndTime(event.target.value)}
                      onFocus={(event) => { if (!isMobile) event.target.select() }}
                      onBlur={handleBlur}
                      disabled={!isFocused || inboxState !== 'EDIT_TIME'}
                    />
                  </div>
                </>
              )}
            </Container>
          )
        }
      </div>
    </OutsideClickListener>
  )
}

const Container = styled.div`
  width: 105px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const TimeStampInput = styled.input`
  width: 50px;
  font-size: 16px;
  color: ${props => props.theme.text.light};
  text-align: center;

  &:disabled {
    background: inherit;
  }
`

export default TaskTime

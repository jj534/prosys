import { useQueryClient } from 'react-query'
import { useDispatch } from 'react-redux'
import { isObjShallowEqual } from 'src/util/js'
import useCustomMutation, { queryConfigToKey } from 'src/hooks/useCustomMutation'
import useCustomQuery from 'src/hooks/useCustomQuery'
import useRouter from 'src/hooks/useRouter'
import { showSnackbar } from 'src/redux/snackbarSlice'
import { ITask, IUseProsysTasksParams, IUseUpdateInboxTaskByIdOptions } from 'src/types/task.type'
import {
  insertTimedTask,
  insertUntimedTask,
  isOneTaskTimeSet,
  reinsertTimedTask,
  sortTasks,
} from 'src/util/task'
import { getStartOfDay } from 'src/util/date'

export const fetchInboxTasks = () => ({
  url: '/private/task/inbox',
  options: {
    refetchOnWindowFocus: 'always',
  },
})

export const useInboxTasks = () => {
  const { data: tasks, error, ...rest } = useCustomQuery<ITask[]>(fetchInboxTasks())

  const router = useRouter()
  const dispatch = useDispatch()

  if ((error as any)?.response?.data === 'Google OAuth error') {
    dispatch(
      showSnackbar({
        variant: 'error',
        message: 'Google calendar session expired',
      })
    )
    router.push('/logout')
  }

  return {
    ...rest,
    tasks: tasks && sortTasks(tasks),
  }
}

export const fetchGcalTasks = (due: Date) => ({
  url: `/private/task/inbox/gcal?due=${due.toISOString()}`,
  options: {
    refetchOnWindowFocus: 'always',
  },
})

export const useGcalTasks = (due: Date) => {
  const { data: gcalTasks, ...rest } = useCustomQuery<ITask[]>(fetchGcalTasks(due))

  return {
    ...rest,
    gcalTasks,
  }
}

export const prosysTasksConfig = (params: IUseProsysTasksParams) => ({
  url: `/private/task/inbox/prosys?due=${getStartOfDay(new Date(params?.due))}&isTimed=${
    params?.isTimed
  }`,
  options: {
    refetchOnWindowFocus: 'always',
  },
})

export const useProsysTasks = (params: IUseProsysTasksParams) => {
  const { data: tasks, ...rest } = useCustomQuery<ITask[]>(prosysTasksConfig(params))

  return {
    ...rest,
    tasks,
  }
}

export const fetchArchivedTasks = () => ({
  url: '/private/task/archive',
  options: {
    refetchOnWindowFocus: 'always',
  },
})

export const useArchivedTasks = () => {
  const { data: tasks, ...rest } = useCustomQuery<ITask[]>(fetchArchivedTasks())

  return {
    ...rest,
    tasks,
  }
}

export const useCreateInboxTask = () => {
  const { mutate: createInboxTask, ...rest } = useCustomMutation<ITask>({
    url: '/private/task',
    method: 'post',
    localUpdates: [
      {
        queryConfigs: [fetchInboxTasks()],
        presetLogic: 'appendStart',
      },
    ],
  })

  return {
    ...rest,
    createInboxTask,
  }
}

export const useCreateInboxTaskAtDate = (params: IUseProsysTasksParams) => {
  const { mutate: createInboxTask, ...rest } = useCustomMutation<ITask>({
    url: '/private/task',
    method: 'post',
    localUpdates: [
      {
        queryConfigs: [prosysTasksConfig(params)],
        presetLogic: 'appendEnd',
      },
    ],
  })

  return {
    ...rest,
    createInboxTask,
  }
}

export const useCreateArchiveTask = () => {
  const { mutate: createArchiveTask, ...rest } = useCustomMutation<ITask>({
    url: '/private/task',
    method: 'post',
    localUpdates: [
      {
        queryConfigs: [fetchArchivedTasks()],
        presetLogic: 'appendStart',
      },
    ],
  })

  return {
    ...rest,
    createArchiveTask,
  }
}

export const useUpdateInboxTaskById = (_id: string, params: IUseProsysTasksParams) => {
  const { mutate: updateInboxTask, ...rest } = useCustomMutation<ITask>({
    url: `/private/task/${_id}`,
    method: 'put',
    localUpdates: [
      {
        queryConfigs: [prosysTasksConfig(params)],
        presetLogic: 'update',
        refetchOnSettle: false,
      },
    ],
  })

  return {
    ...rest,
    updateInboxTask,
  }
}

export const useUpdateAndMoveTask = (_id: string, params: IUseProsysTasksParams) => {
  const queryClient = useQueryClient()

  const { mutate: updateAndMove, ...rest } = useCustomMutation<ITask>({
    url: `/private/task/${_id}`,
    method: 'put',
    localUpdates: [
      {
        queryConfigs: [prosysTasksConfig(params)],
        presetLogic: 'update',
        refetchOnSettle: false,
      },
      {
        queryConfigs: [prosysTasksConfig(params)],
        refetchOnSettle: false,
        mutationFn: (oldData, newVariables) => {
          // if task doesn't need to move, don't move it
          if (
            params?.due.toUTCString() === newVariables?.due.toUTCString() &&
            params?.isTimed === isOneTaskTimeSet(newVariables)
          ) {
            return oldData
          }

          // add to new query cache
          const targetQueryKey = queryConfigToKey(
            prosysTasksConfig({
              isTimed: isOneTaskTimeSet(newVariables),
              due: newVariables?.due,
            })
          )

          queryClient.setQueryData(targetQueryKey, (oldData: any) => {
            // use appropriate logic depending on whether it's timed or not
            if (params?.isTimed) {
              return insertTimedTask({
                tasks: oldData || [],
                newTask: newVariables,
              })
            } else {
              return insertUntimedTask({
                tasks: oldData || [],
                newTask: newVariables,
              })
            }
          })

          // remove from current query cache
          return oldData?.filter((task: ITask) => task?._id !== newVariables?._id)
        },
      },
    ],
  })

  return {
    ...rest,
    updateAndMove,
  }
}

export const useUpdateArchiveTaskById = (
  _id: string,
  options: IUseUpdateInboxTaskByIdOptions = {
    due: new Date(),
    refetchOnSettle: false,
  }
) => {
  const { mutate: updateArchiveTask, ...rest } = useCustomMutation<ITask>({
    url: `/private/task/${_id}`,
    method: 'put',
    localUpdates: [
      {
        queryConfigs: [fetchArchivedTasks()],
        presetLogic: 'update',
        refetchOnSettle: options?.refetchOnSettle,
      },
    ],
  })

  return {
    ...rest,
    updateArchiveTask,
  }
}

export const useToggleArchive = (_id: string) => {
  const { mutate: toggleArchive, ...rest } = useCustomMutation<ITask>({
    url: `/private/task/${_id}`,
    method: 'put',
    localUpdates: [
      {
        queryConfigs: [fetchInboxTasks(), fetchArchivedTasks()],
        presetLogic: 'delete',
      },
    ],
  })

  return {
    ...rest,
    toggleArchive,
  }
}

export const useUndoIsComplete = () => {
  const { mutateAsync: undoIsComplete, ...rest } = useCustomMutation<ITask>({
    url: `/private/task/undo`,
    method: 'put',
    localUpdates: [
      {
        queryConfigs: [fetchInboxTasks(), fetchArchivedTasks()],
      },
    ],
  })

  return {
    ...rest,
    undoIsComplete,
  }
}

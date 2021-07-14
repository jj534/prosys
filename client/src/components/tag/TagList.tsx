import React from 'react'
import { ITag } from 'src/types/tag.type'
import styled from 'styled-components'
import TagItem from './TagItem'

interface TagListProps {
  tags: ITag[]
  selectedTagIds: string[]
  setSelectedTagIds?: React.Dispatch<React.SetStateAction<string[]>>
  isCreate?: boolean
  isFiltered?: boolean
}

const TagList = ({
  tags,
  selectedTagIds,
  setSelectedTagIds,
  isCreate,
  isFiltered,
}: TagListProps) => {
  const handleTagClick = (tid: string) => {
    if (setSelectedTagIds) {
      if (selectedTagIds.includes(tid)) {
        // unselect
        setSelectedTagIds((ids) => {
          const newIds = [...ids]
          newIds.splice(newIds.indexOf(tid), 1)
          return newIds
        })
      } else {
        // select
        setSelectedTagIds((ids) => [...ids, tid])
      }
    }
  }

  return (
    <Container>
      {tags
        ?.filter((tag) => !isFiltered || selectedTagIds.includes(tag?._id))
        ?.map((tag) => (
          <TagItem
            key={tag?._id}
            label={tag?.label}
            isSelected={selectedTagIds.includes(tag?._id)}
            onClick={() => handleTagClick(tag?._id)}
          />
        ))}
      {!!isCreate && <TagItem isCreate />}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  overflow-x: auto;

  & > * {
    margin-right: 0.5rem;
  }
`

export default TagList

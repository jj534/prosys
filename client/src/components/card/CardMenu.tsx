import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined'
import React, { memo } from 'react'
import { useDeleteCardById } from 'src/api/card'
import { ICard, ICardStatus } from 'src/types/card.type'
import styled from 'styled-components'
import ButtonedIcon from '../ButtonedIcon'
import Menu, { IOption } from '../Menu'

interface CardMenuProps {
  status: ICardStatus
  setStatus: React.Dispatch<React.SetStateAction<ICardStatus>>
  card: ICard
}

const CardMenu = ({ status, setStatus, card }: CardMenuProps) => {
  const { deleteCard } = useDeleteCardById(card?._id)

  const commonOptions: IOption[] = [
    {
      label: 'Delete',
      onClick: () => deleteCard({ _id: card?._id, isDeleted: true }),
    },
  ]

  const menuOptions: IOption[] =
    status === 'EDITING'
      ? [...commonOptions]
      : [
          {
            label: 'Edit',
            onClick: () => setStatus('EDITING'),
          },
          ...commonOptions,
        ]

  return (
    <Container>
      <Menu options={menuOptions} offset={10}>
        <ButtonedIcon icon={<MoreVertOutlinedIcon />} buttonSize='small' />
      </Menu>
    </Container>
  )
}

const Container = styled.div``

export default memo(CardMenu)

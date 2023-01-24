import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { styled } from '@mui/material/styles';

export const StyledListItem = styled(ListItem)(({ theme }) => ({
  '& .MuiListItem-root': {
    padding: '8px',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

export const StyledList = styled(List)(({ theme }) => ({
  '	.MuiList-padding': {
    padding: '8px',
  },
  '& .MuiList-root': {
    background: 'theme.palette.background.paper',
  },
}));

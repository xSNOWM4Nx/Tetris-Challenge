import React, { useState, useContext } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { INavigationElementBase, INavigationService, ServiceKeys } from '@daniel.neuweiler/ts-lib-module';
import { SystemContext, SelectableMenu, ISelectableProps } from '@daniel.neuweiler/react-lib-module';

import { ViewNavigationElements, ViewKeys } from './../navigation';

import MenuIcon from '@mui/icons-material/Menu';

interface ILocalProps {
}
type Props = ILocalProps;

const selectableMenuItems: Array<ISelectableProps> = [
  ViewNavigationElements[ViewKeys.SettingsView],
  ViewNavigationElements[ViewKeys.LogView],
  ViewNavigationElements[ViewKeys.AboutView]
]

const HeaderBar: React.FC<Props> = (props) => {

  // States
  const [navigationMenuAnchor, setNavigationMenuAnchor] = useState<HTMLElement | null>(null);

  // Contexts
  const systemContext = useContext(SystemContext);
  const navigationService = systemContext.getService<INavigationService>(ServiceKeys.NavigationService);

  const handleOpenNavigationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNavigationMenuAnchor(event.currentTarget);
  };

  const handleMenuSelect = (e: React.MouseEvent<HTMLElement>, item: ISelectableProps, index: number) => {

    setNavigationMenuAnchor(null);

    if (navigationService)
      navigationService.show(item as INavigationElementBase);
  };

  return (
    <React.Fragment>

      <AppBar
        position='static'
        enableColorOnDark={true}
        color='primary'>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center'
          }}>

          <Toolbar>

            <IconButton
              size="large"
              color="inherit"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavigationMenu}>
              <MenuIcon />
            </IconButton>

            <Typography
              variant='h6'
              noWrap={true}>
              {'PlayerName'}
            </Typography>



          </Toolbar>
        </Box>
      </AppBar >

      <SelectableMenu
        anchor={navigationMenuAnchor}
        items={selectableMenuItems}
        onLocalize={(localizableContent) => localizableContent.value}
        onSelect={handleMenuSelect}
        onClose={() => setNavigationMenuAnchor(null)} />

    </React.Fragment>
  );
}

export default HeaderBar;
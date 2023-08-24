import React, { useState, useEffect } from 'react';
import { INavigationRequest, NavigationTypeEnumeration } from '@daniel.neuweiler/ts-lib-module';
import { ViewInjector, INavigationElementProps } from '@daniel.neuweiler/react-lib-module';
import { Box } from '@mui/material';

import HeaderBar from './../components/HeaderBar';
import ViewInjectorDialog from './../dialogs/ViewInjectorDialog';
import { ViewNavigationElements, ViewKeys } from './../navigation';

interface ILocalProps {
  navigationRequest?: INavigationRequest;
  onNavigationError: (sourceName: string, errorMessage: string) => void;
}
type Props = ILocalProps;

const RegistrationPage: React.FC<Props> = (props) => {

  // Helpers


  return (

    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>



    </Box>
  );
}

export default RegistrationPage;
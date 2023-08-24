import React, { useContext, useRef, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { INavigationService, ServiceKeys, INavigationRequest } from '@daniel.neuweiler/ts-lib-module';
import { SystemContext } from '@daniel.neuweiler/react-lib-module';

import RegistrationPage from './RegistrationPage';
import GamePage from './GamePage';
import ErrorPage from './ErrorPage';

interface ILocalProps {
}
type Props = ILocalProps;

const RouterPage: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'RouterPage'

  // External hooks
  const navigate = useNavigate();

  // Contexts
  const systemContext = useContext(SystemContext);
  const navigationService = systemContext.getService<INavigationService>(ServiceKeys.NavigationService);

  // States
  const [navigationRequest, setNavigationRequest] = useState<INavigationRequest | undefined>(undefined);

  // Refs
  const navigationSubscriptionRef = useRef<string>('');
  const errorSourceNameRef = useRef('');
  const errorMessageRef = useRef('');

  // Effects
  useEffect(() => {

    // Mount
    if (navigationService) {

      // Get a register key for the subscription and save it as reference
      const registerKey = navigationService.onNavigationRequest(contextName, handleNavigationRequest);
      navigationSubscriptionRef.current = registerKey;
    }

    // Unmount
    return () => {

      if (navigationService) {

        // Get the register key from the reference to unsubscribe
        const registerKey = navigationSubscriptionRef.current;
        navigationService.offNavigationRequest(registerKey);
      }
    }
  }, []);

  const handleNavigationError = (sourceName: string, errorMessage: string) => {

    // Setup error references
    errorSourceNameRef.current = sourceName;
    errorMessageRef.current = errorMessage;

    // Go to error page
    navigate('/error');
  };

  const handleNavigationRequest = (navigationRequest: INavigationRequest) => {

    setNavigationRequest(navigationRequest);

    if (navigationRequest.url !== undefined)
      navigate(navigationRequest.url);
  };

  return (

    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) => theme.palette.primary.main
      }}>

      <Box
        sx={{
          overflow: 'hidden',
          flex: 'auto',
          margin: (theme) => theme.spacing(1),
          backgroundColor: (theme) => theme.palette.background.default,
          color: (theme) => theme.palette.text.secondary
        }}>

        <Routes>

          {/* Redirect to 'StartPage' on a unknown path */}
          <Route
            path="/"
            element={
              <Navigate
                replace to="/registration" />
            } />

          <Route
            path="/registration"
            element={
              <RegistrationPage
                navigationRequest={navigationRequest}
                onNavigationError={handleNavigationError} />
            }
          />
          <Route
            path="/game"
            element={
              <GamePage
                navigationRequest={navigationRequest}
                onNavigationError={handleNavigationError} />
            }
          />
          <Route
            path="/error"
            element={
              <ErrorPage />
            } />

        </Routes>

      </Box>
    </Box>
  );
}

export default RouterPage;

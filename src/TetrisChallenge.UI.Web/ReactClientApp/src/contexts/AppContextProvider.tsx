import React, { useState, useContext, useEffect } from 'react';
import { LogProvider, IResponse, ResponseStateEnumeration, createResponse, ServiceKeys, IRESTService } from '@daniel.neuweiler/ts-lib-module';
import { SystemContext } from '@daniel.neuweiler/react-lib-module';
import { IGameUser, GameUserRoleEnumeration, IAuthenticatedGameUser, IRegistrationCredentials, ILoginCredentials } from './../identity';
import { ThemeKeys } from './../styles';

// Definition for app context props
export interface AppContextProps {
  activeUser?: IAuthenticatedGameUser;
  registerUser: (credentials: IRegistrationCredentials) => Promise<IResponse<boolean>>;
  loginUser: (credentials: ILoginCredentials) => Promise<IResponse<boolean>>;
  logoutUser: () => Promise<IResponse<boolean>>;
  getUsers: () => Promise<IResponse<Array<IGameUser>>>;
  hasConnectionErrors: boolean;
  activeThemeName: string;
  changeTheme: (themeName: string) => void;
};

// Create the app context
export const AppContext = React.createContext<AppContextProps>({
  activeUser: { name: 'Anonymous', roles: [GameUserRoleEnumeration.Anonymous], token: '' },
  registerUser: () => Promise.resolve(createResponse(false)),
  loginUser: () => Promise.resolve(createResponse(false)),
  logoutUser: () => Promise.resolve(createResponse(false)),
  getUsers: () => Promise.resolve(createResponse([])),
  hasConnectionErrors: false,
  activeThemeName: ThemeKeys.DarkTheme,
  changeTheme: (themeName: string) => { }
});

interface ILocalProps {
  children?: React.ReactNode;
  onThemeChange?: (themeName: string) => void;
};
type Props = ILocalProps;

const AppContextProvider: React.FC<Props> = (props) => {

  // Fields
  const contextName: string = 'AppContextProvider';
  const logger = LogProvider.getLogger(contextName);

  // Contexts
  const systemContext = useContext(SystemContext);

  // States
  const [activeUser, setActiveUser] = useState<IAuthenticatedGameUser>();
  const [activeThemeName, setActiveThemeName] = useState(ThemeKeys.DarkTheme);
  const [hasConnectionErrors, setConnectionErrors,] = useState(false);

  // Effects
  useEffect(() => {

    // Mount
    const anonymousLogin: ILoginCredentials = {
      name: 'Anonymous',
      password: 'Anonymous'
    };

    handleLoginUser(anonymousLogin);

    // Unmount
    return () => {
    }
  }, []);

  const dispatchAuthenticationToken = (token: string) => {

    const defaultErrorText = `Authentication token for active user can not be dispatched.`;

    const restService = systemContext.getService<IRESTService>(ServiceKeys.RESTService);
    if (restService === undefined)
      logger.error(`${defaultErrorText} REST service can not be resolved.`);
    else
      restService.setAuthorization(`Bearer ${token}`);
  };

  const handleRegisterUser = async (credentials: IRegistrationCredentials) => {

    const defaultErrorText = `Registration for user [${credentials.name}] has failed.`;

    // Setup response
    const response: IResponse<boolean> = {
      state: ResponseStateEnumeration.Error,
      messageStack: [],
      payload: false
    };

    // Get REST service
    const restService = systemContext.getService<IRESTService>(ServiceKeys.RESTService);
    if (restService === undefined) {

      logger.error(`${defaultErrorText} REST service can not be resolved.`);
      response.state = ResponseStateEnumeration.Error;
      return response;
    };

    // POST register call
    const registerResponse = await restService.post<IAuthenticatedGameUser>('/api/user/registeruser', credentials);
    response.state = registerResponse.state;
    response.messageStack = registerResponse.messageStack;
    if (registerResponse.state !== ResponseStateEnumeration.OK) {

      logger.error(`${defaultErrorText} REST request has faild.`);
      return response;
    };
    if (!registerResponse.payload) {

      logger.error(`${defaultErrorText} REST request has no valid payload.`);
      return response;
    };

    // Set user data
    logger.info(`User [${credentials.name}] is registred and logged in.`);
    setActiveUser(registerResponse.payload);
    //dispatchAuthenticationToken(registerResponse.payload.token);

    response.payload = true;
    return response;
  };

  const handleLoginUser = async (credentials: ILoginCredentials) => {

    const defaultErrorText = `Login for user [${credentials.name}] has failed.`;

    // Setup response
    const response: IResponse<boolean> = {
      state: ResponseStateEnumeration.Error,
      messageStack: [],
      payload: false
    };

    // Get REST service
    const restService = systemContext.getService<IRESTService>(ServiceKeys.RESTService);
    if (restService === undefined) {

      logger.error(`${defaultErrorText} REST service can not be resolved.`);
      return response;
    };
    //const restService = new RESTService('HansPeter')

    // POST login call
    const loginResponse = await restService.post<IAuthenticatedGameUser>('/v1/authentication/loginuser', credentials);
    response.state = loginResponse.state;
    response.messageStack = loginResponse.messageStack;
    if (loginResponse.state !== ResponseStateEnumeration.OK) {
      logger.error(`${defaultErrorText} REST request has faild.`);
      return response;
    };
    if (!loginResponse.payload) {
      logger.error(`${defaultErrorText} REST request has no valid payload.`);
      return response;
    };

    // Set user data
    logger.info(`User [${credentials.name}] is logged in.`);
    setActiveUser(loginResponse.payload);
    dispatchAuthenticationToken(loginResponse.payload.token);

    response.payload = true;
    return response;
  };

  const handleLogoutUser = async () => {

    if (activeUser) {

      logger.info(`User [${activeUser.name}] is logged out.`);
    }

    const anonymousLogin: ILoginCredentials = {
      name: 'Anonymous',
      password: 'Anonymous'
    };

    return await handleLoginUser(anonymousLogin);
  };

  const handleGetUsers = async () => {

    const defaultErrorText = `Getting all users has failed.`;

    // Get REST service
    const restService = systemContext.getService<IRESTService>(ServiceKeys.RESTService);
    if (restService === undefined) {

      logger.error(`${defaultErrorText} REST service can not be resolved.`);
      return createResponse<Array<IGameUser>>([], ResponseStateEnumeration.Error, []);
    };

    return await restService.get<Array<IGameUser>>('/api/user/getusers');
  };

  const handleThemeChange = (themeName: string) => {

    if (props.onThemeChange)
      props.onThemeChange(themeName);

    setActiveThemeName(themeName);
  };

  return (

    <AppContext.Provider
      value={
        {
          activeUser: activeUser,
          registerUser: handleRegisterUser,
          loginUser: handleLoginUser,
          logoutUser: handleLogoutUser,
          getUsers: handleGetUsers,
          hasConnectionErrors: hasConnectionErrors,
          activeThemeName: activeThemeName,
          changeTheme: handleThemeChange
        }} >
      {props.children}
    </AppContext.Provider>
  );
}

export default AppContextProvider;

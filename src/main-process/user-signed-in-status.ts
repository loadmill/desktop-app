let _userIsSignedIn: boolean = false;

export const isUserSignedIn = (): boolean => _userIsSignedIn;

export const setIsUserSignedIn = (isSignedIn: boolean): void => {
  _userIsSignedIn = isSignedIn;
};

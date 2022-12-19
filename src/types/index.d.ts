export { };

declare global {
  interface Window {
    loadmillDesktop: {
      goBack: () => void;
      goForward: () => void;
      newToken: (token: string) => void;
      refreshPage: () => void;
      setIsUserSignedIn: (isSignedIn: boolean) => void;
      toggleMaximizeWindow: () => void;
    }
  }
}

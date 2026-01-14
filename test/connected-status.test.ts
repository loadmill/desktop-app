import {
  isAgentConnected,
  refreshConnectedStatus,
} from '../src/main-process/connected-status';

describe('connected-status', () => {
  beforeEach(() => {
    refreshConnectedStatus({ isConnected: false });
  });

  it('starts disconnected by default', () => {
    expect(isAgentConnected()).toBe(false);
  });

  it('sets connected when stdout includes success line', () => {
    refreshConnectedStatus({
      text: 'foo\nSuccessfully connected to Loadmill\nbar',
    });
    expect(isAgentConnected()).toBe(true);
  });

  it('sets disconnected when stdout includes disconnect line', () => {
    refreshConnectedStatus({
      text: 'Successfully connected to Loadmill\nDisconnected from Loadmill',
    });
    expect(isAgentConnected()).toBe(false);
  });

  it('sets disconnected when stdout includes outdated line', () => {
    refreshConnectedStatus({
      text: '[ERROR] The agent is outdated',
    });
    expect(isAgentConnected()).toBe(false);
  });

  it('explicit isConnected overrides current state', () => {
    refreshConnectedStatus({
      text: 'Successfully connected to Loadmill',
    });
    expect(isAgentConnected()).toBe(true);

    refreshConnectedStatus({ isConnected: false });
    expect(isAgentConnected()).toBe(false);
  });
});

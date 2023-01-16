import { useTheme } from '@mui/material/styles';
import React from 'react';
import ReactJson from 'react-json-view';

declare module 'react-json-view' {
  export interface ReactJsonViewProps {
    displayArrayKey: boolean
  }
}
export const JSONDisplay = ({
  json,
}: JSONDisplayProps): JSX.Element => {
  const theme = useTheme();

  return (
    <ReactJson
      collapseStringsAfterLength={ 100 }
      displayArrayKey={ false }
      displayDataTypes={ false }
      displayObjectSize={ false }
      enableClipboard={ false }
      shouldCollapse={ ({ namespace, type }) => {
        if (!isRootObject(namespace)) {
          return true;
        }
        if (type === 'array') {
          return true;
        }
        return false;
      } }
      src={ json }
      style={ {
        background: theme.palette.action.selected,
        cursor: 'text',
        fontFamily: theme.typography.fontFamily,
        padding: '1rem',
      } }
      theme='mocha'
    />
  );
};

export type JSONDisplayProps = {
  json: object;
};
const isRootObject = (namespace: string[]) =>
  namespace.length === 1 && namespace[0] === 'root';

// const isObject = (value: unknown): boolean => {
//   return value !== null && typeof value === 'object';
// };

//q: how to check if key of object is the root of the object?
// a: if the key is '0' and the value is an object
//  q: check if var points to the root of the object
// a:

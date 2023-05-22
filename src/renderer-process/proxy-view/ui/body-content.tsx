import isHtml from 'is-html';
import prettyHTML from 'pretty';
import React from 'react';

import { Body } from '../../../types/body';
import { toPrettyJsonString } from '../../../universal/utils';

import { CopyButton } from './copy-button';

export const BodyContent = ({
  body,
  shouldDecode = false,
}: BodyContentProps): JSX.Element => {
  const { className, prettyText } = getBodyContentProps(body, shouldDecode);

  return (
    <div
      style={ {
        position: 'relative',
      } }
    >
      <CopyButton
        sx={ {
          bgcolor: theme => theme.palette.background.paper,
          position: 'absolute',
          right: 4,
          top: 8,
        } }
        text={ prettyText }
      />
      <pre className={ 'body-content ' + className }>
        { prettyText }
      </pre>
    </div>
  );
};

export type BodyContentProps = {
  body: Body;
  shouldDecode?: boolean;
};

const isJSON = (mimeType: string, text: string): boolean => {
  try {
    JSON.parse(text);
  } catch (error) {
    return false;
  }
  return mimeType.includes('json');
};

const isHTML = (mimeType: string, text: string): boolean => {
  return isHtml(text) || mimeType.includes('text/html');
};

const isBinary = (content: string) => {
  for (let i = 0; i < 24; i++) {
    const charCode = content.charCodeAt(i);
    if (charCode === 65533 || charCode <= 8) {
      return true;
    }
  }
  return false;
};

type BodyContentTextProps = {
  className: string;
  prettyText: string;
};

const getBodyContentProps = ({ mimeType = '', text = '' }: Body, shouldDecode = false): BodyContentTextProps => {
  text = shouldDecode ? atob(text) : text;
  if (isJSON(mimeType, text)) {
    return {
      className: 'json-display',
      prettyText: toPrettyJsonString(JSON.parse(text)),
    };
  }
  if (isHTML(mimeType, text)) {
    return {
      className: 'html-display',
      prettyText: prettyHTML(text, { ocd: true }),
    };
  }
  return {
    className: '',
    prettyText: isBinary(text) ? 'Binary data' : text,
  };
};

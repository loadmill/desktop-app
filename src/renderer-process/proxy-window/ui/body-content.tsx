import Typography from '@mui/material/Typography';
import isHtml from 'is-html';
import prettyHTML from 'pretty';
import React from 'react';

import { Body } from '../../../types/proxy-entry';

import { CopyButton } from './copy-button';

export const BodyContent = ({
  body,
}: BodyContentProps): JSX.Element => {
  const { className, prettyText } = getBodyContentProps(body);

  return (
    <div
      style={ {
        position: 'relative',
      } }
    >
      <CopyButton
        sx={ {
          position: 'absolute',
          right: 4,
          top: 8,
        } }
        text={ prettyText }
      />
      <Typography
        className={ 'body-content ' + className }
        component="pre"
      >
        <code>{prettyText}</code>
      </Typography>
    </div>
  );
};

export type BodyContentProps = {
  body: Body;
};

const isJSON = (mimeType: string, text: string): boolean => {
  try {
    JSON.parse(text);
  } catch (error) {
    return false;
  }
  return mimeType.includes('application/json');
};

const isHTML = (mimeType: string, text: string): boolean => {
  return isHtml(text) || mimeType.includes('text/html');
};

const prettyJson = (json: object): string => {
  return JSON.stringify(json, null, 2);
};

type BodyContentTextProps = {
  className: string;
  prettyText: string;
};

const getBodyContentProps = ({ mimeType = '', text = '' }: Body): BodyContentTextProps => {
  if (isJSON(mimeType, text)) {
    return {
      className: 'json-display',
      prettyText: prettyJson(JSON.parse(text)),
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
    prettyText: text,
  };
};

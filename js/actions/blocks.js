/**
 * @flow
 */

export const SET_BLOCKS = 'SET_BLOCKS';
export const UPDATE_BLOCKS = 'UPDATE_BLOCKS';

export const setBlocks = (blocks: object) => {

  return {
    type: SET_BLOCKS,
    payload: blocks || {},
  }
};

export const updateBlocks = (block: object) => {
  return {
    type: UPDATE_BLOCKS,
    payload: block
  }
};

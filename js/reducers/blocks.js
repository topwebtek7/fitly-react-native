import { SET_BLOCKS, UPDATE_BLOCKS } from '../actions/blocks.js';

const initialState = {
  blocks: {}
};

export default function (state: object = initialState, action: object): object {
  switch (action.type) {
    case SET_BLOCKS:
      const blocks = action.payload;
      return {
        blocks: blocks,
      };
    case UPDATE_BLOCKS:
      return {
        blocks: Object.assing({}, this.state.blocks, action.payload)
      };
    default:
    return state;
  }
};

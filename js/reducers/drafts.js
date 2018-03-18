import { SAVE_DRAFT, CLEAR_DRAFT } from '../actions/drafts.js';

const initialState = {
  drafts: {},
  length: 0,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SAVE_DRAFT:
      const draftRef = action.draftRef;
      if (!state.drafts[draftRef]) {
        const newDrafts = {
          ...state.draft,
          [draftRef]: action.payload
        };
        return {
          drafts: newDrafts,
          length: state.length + 1
        }
      } else {
        const draft = state.drafts[draftRef];
        const newDraft = {
          ...draft,
          ...action.payload
        };
        const newDrafts = {
          ...state.drafts,
          [draftRef]: newDraft,
        };
        return {
          drafts: newDrafts,
          length: state.length
        };
      }

    case CLEAR_DRAFT:
      if (state.drafts[action.draftRef]) {
        let stateCopy = Object.assign({}, state);
        delete stateCopy.drafts[action.draftRef];
        stateCopy.length--;
        return stateCopy;
      } else {
        return state;
      }

    default:
    return state;
  }
};

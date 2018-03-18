export const SAVE_DRAFT = 'SAVE_DRAFT';
export const CLEAR_DRAFT = 'CLEAR_DRAFT';

export const save = (draftRef: string, state: boolean) => {
  return {
    type: SAVE_DRAFT,
    draftRef: draftRef,
    payload: state
  }
};

export const clear = (draftRef: string) => {
  return {
    type: CLEAR_DRAFT,
    draftRef: draftRef
  }
};

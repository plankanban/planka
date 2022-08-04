import EntryActionTypes from '../constants/EntryActionTypes';

const fetchActivitiesInCurrentCard = () => ({
  type: EntryActionTypes.ACTIVITIES_IN_CURRENT_CARD_FETCH,
  payload: {},
});

const toggleActivitiesDetailsInCurrentCard = (isVisible) => ({
  type: EntryActionTypes.ACTIVITIES_DETAILS_IN_CURRENT_CARD_TOGGLE,
  payload: {
    isVisible,
  },
});

const handleActivityCreate = (activity) => ({
  type: EntryActionTypes.ACTIVITY_CREATE_HANDLE,
  payload: {
    activity,
  },
});

const handleActivityUpdate = (activity) => ({
  type: EntryActionTypes.ACTIVITY_UPDATE_HANDLE,
  payload: {
    activity,
  },
});

const handleActivityDelete = (activity) => ({
  type: EntryActionTypes.ACTIVITY_DELETE_HANDLE,
  payload: {
    activity,
  },
});

export default {
  fetchActivitiesInCurrentCard,
  toggleActivitiesDetailsInCurrentCard,
  handleActivityCreate,
  handleActivityUpdate,
  handleActivityDelete,
};

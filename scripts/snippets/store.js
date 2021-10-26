module.exports = {
  crud: `import envalidate from '@siliconminds/envalidate';
import Api from '@siliconminds/api';
import { required, } from '@siliconminds/validation/validators';

envalidate('VUE_APP_API_URL');

const api = new Api(process.env.VUE_APP_API_URL);

const endpoint = '{{name}}';

export default {
  namespaced: true,
  state: {
    pagination: {
      limit: 25,
      prev: false,
      page: 1,
      next: false,
      last: false,
    },
    fields: [
      {
        label: '',
        key: '',
        type: '',
        editable: true,
        validators: { required },
      },
    ],
    all: [],
    single: {},
  },
  getters: {
    fields: (state) => state.fields,

    all: (state) => state.all,
    single: (state) => state.single,

    pagination: (state) => state.pagination,
  },
  actions: {
    async set_page({ dispatch, commit, getters }, page) {
      const { pagination } = getters;
      if ((page < 0 && pagination.page > 1) || (page > 0 && pagination.page < pagination.last)) {
        commit('setPage', page);
      }
      dispatch('get_all');
    },

    async get_all({ commit, getters }, payload = {}) {
      commit('clearError', null, { root: true });
      const { pagination } = getters;
      const res = await api.get(endpoint, { query: {
        ...payload,
        _page: pagination.page,
        _limit: pagination.limit,
      } });
      if (!res.success) return commit('pushError', res.error, { root: true });
      commit('setPagination', res.pagination);
      return commit('setAll', res.data);
    },
    async get_single({ commit }, id) {
      commit('clearError', null, { root: true });
      const res = await api.get(\`\${endpoint}/\${id}\`);
      if (!res.success) return commit('pushError', res.error, { root: true });
      return commit('setSingle', res.data);
    },
    async post({ commit }, payload) {
      commit('clearError', null, { root: true });
      const res = await api.post(endpoint, payload);
      if (!res.success) return commit('pushError', res.error, { root: true });
      return commit('push', res.data);
    },
    async put({ commit }, payload) {
      commit('clearError', null, { root: true });
      const res = await api.put(\`\${endpoint}/\${payload._id}\`, payload);
      if (!res.success) return commit('pushError', res.error, { root: true });
      return commit('update', payload);
    },
    async delete({ commit, getters, dispatch }, payload) {
      commit('clearError', null, { root: true });
      const res = await api.delete(\`\${endpoint}/\${payload._id}\`);
      if (!res.success) return commit('pushError', res.error, { root: true });
      commit('delete', payload);
      if (getters.pagination.page > 1 && getters.all.length < 1) return dispatch('set_page', -1);
      return true;
    },
  },
  mutations: {
    setAll: (state, items) => { state.all = items; },
    setSingle: (state, item) => { state.single = item; },
    push: (state, item) => { state.all.push(item); },
    update: (state, item) => { state.all[state.all.findIndex((el) => el._id.toString() === item._id.toString())] = item; },
    delete: (state, item) => { state.all = state.all.filter(el => el._id.toString() !== item._id.toString()); },

    setPagination: (state, pagination) => { state.pagination = pagination; },
    setPage: (state, page) => { state.pagination.page += page; },
  },
};
`,
  blank: `export default {
  // state for the store
  state: {

  },
  // getters for components
  getters: {

  },
  // async actions called by components
  actions: {

  },
  // commit changes to the store
  mutations: {

  },
};
`
}
module.exports = {
  data: () => ({
    dirtyFields: {},
  }),
  computed: {
    valid() {
      return Object.keys(this.errors).length < 1;
    },
    errors() {
      if (!this.fields) return console.errors('fields is not set!');
      const errors = {};
      this.fields
        .filter(field => !!field.validators)
        .forEach(field => {
          Object.keys(field.validators)
            .reverse()
            .forEach(validator => {
              const error = field.validators[validator](this.modelValue[field.key]);
              if (error) errors[field.key] = error;
            });
        });
      return errors;
    },
  },
  methods: {
    dirty(key) {
      this.dirtyFields[key] = true;
    },
    clean(key) {
      this.dirtyFields[key] = false;
    },
    getError(key) {
      if (!this.dirtyFields[key]) return '';
      if (!this.errors[key]) return '';
      return this.errors[key];
    },
  },
};

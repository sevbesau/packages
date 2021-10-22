module.exports = `<template>
  <div class="">
    {{name}}
  </div>
</template>

<script>
export default {
  name: '{{name}}',
  async mounted() {
    console.log('mounted {{name}}');
  },
};
</script>
`;
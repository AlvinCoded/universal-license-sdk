import DefaultTheme from 'vitepress/theme';
import './style.css';
import HomeFeatures from './components/HomeFeatures.vue';
import CodeGroup from './components/CodeGroup.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register custom global components
    app.component('HomeFeatures', HomeFeatures);
    app.component('CodeGroup', CodeGroup);
  },
};

import { configure } from '@testing-library/react-native';

// CI runners are slow enough to blow the 1s default on first render of a heavy tree.
configure({ asyncUtilTimeout: 10_000 });

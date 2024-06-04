// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

import { TextEncoder, TextDecoder } from 'util';

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import advancedFormat from "dayjs/plugin/advancedFormat"

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

Object.assign(global, { TextDecoder, TextEncoder });
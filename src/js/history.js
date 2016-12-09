import { useRouterHistory } from "react-router";
import { createHistory } from 'history';

const history = useRouterHistory(createHistory)({
  basename: '/vmi'
});

module.exports = history;

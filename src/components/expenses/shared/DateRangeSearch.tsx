/* eslint-disable no-unused-vars */
import React, { memo } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

import MultipleDateRange from '../../../shared/dates/MultipleDateRange';
import SearchButton from '../../../shared/SearchButton';

const useStyles = makeStyles(() => createStyles({
  root: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
    paddingBottom: 5,
  },
}));

type DateRangeSearchProps = {
    isLoading: boolean,
    isBackButtonShown: boolean,
    fromDate: Date,
    toDate: Date,
    selectFromDate(date: any, value?: string | null): void,
    selectToDate(date: any, value?: string | null): void,
    dateRangeSearchHandler(): void
}

function DateRangeSearch({
  isLoading,
  isBackButtonShown,
  fromDate,
  toDate,
  selectFromDate,
  selectToDate,
  dateRangeSearchHandler,
}: DateRangeSearchProps) {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <MultipleDateRange
        fromDate={fromDate}
        toDate={toDate}
        selectFromDate={selectFromDate}
        selectToDate={selectToDate}
      />
      <SearchButton
        isLoading={isLoading}
        isBackButtonShown={isBackButtonShown}
        dateRangeSearchHandler={dateRangeSearchHandler}
      />
    </Box>
  );
}

export default memo(DateRangeSearch);

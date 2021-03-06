import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Fab } from '@material-ui/core';

import ExpenseList from './ExpenseList';
import DateRangeSearch from './shared/DateRangeSearch';
import NoExpenses from './NoExpenses';
import ConfirmDialog from '../../shared/ConfirmDialog';
import { ExpensesLoader } from '../../shared/ContentLoader';
import CustomTooltip from '../../shared/CustomTooltip';

import { useAppDispatch, RootState } from '../../redux/store';
import {
  fetchExpenses,
  deleteExpense,
  setEditedExpenseState,
  setDidFinishDateRangeSearch,
} from '../../redux/reducers/expenses/fetchOrDeleteExpenses';
import { setDidFinishEditingExpense } from '../../redux/reducers/expenses/editExpense';

import { IExpense } from './IExpense';
import { Category } from './ExpenseForm';

const useStyles = makeStyles((theme) => createStyles({
  root: {
    paddingTop: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: '90vh',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100vh',
    justifyContent: 'center',
  },
  dateContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  backButton: {
    color: theme.palette.common.black,
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
}));

interface ExpenseProps extends RouteComponentProps<'location', {}, { from: string }> {
  selectionHandler: React.Dispatch<React.SetStateAction<string>>
}

export default function ({ location, selectionHandler }: ExpenseProps) {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [isBackButtonShown, setShowBackButton] = useState(false);
  const [fromDate, selectFromDate] = useState(new Date());
  const [toDate, selectToDate] = useState(new Date());
  const [expenseToDelete, setExpenseToDelete] = useState<IExpense | null>(null);

  const {
    didFinishEditingExpense,
    editedExpense,
  } = useSelector((state: RootState) => state.editExpense);

  const { categories } = useSelector((state: RootState) => state.categories);

  const {
    isLoading,
    isDeleting,
    cursor,
    count,
    hasNextPage,
    expenses,
    didFinishDateRangeSearch,
  } = useSelector(
    (state: RootState) => state.fetchOrDeleteExpenses,
  );

  useEffect(() => {
    selectionHandler('expenses');
  }, [selectionHandler]);

  useEffect(() => {
    /** Use cases for condition check one:
       * when saving a newly created expense
       * when saving an edited expense
       * on initial render of the expenses page
       * on router push to the expenses page from another page
     */

    if (!location?.state && !didFinishDateRangeSearch) {
      dispatch(fetchExpenses({ startDate: undefined, endDate: undefined, cursor: undefined }));
    }

    if (didFinishDateRangeSearch) {
      setShowBackButton(true);
    }

    if (didFinishEditingExpense) {
      const editedExpenseCategory = categories.find(
        (cat: Category) => cat._id === editedExpense?.category,
      );
      dispatch(setEditedExpenseState(
        { ...editedExpense, category: editedExpenseCategory } as IExpense,
      ));
    }
  }, [
    dispatch,
    location,
    didFinishDateRangeSearch,
    didFinishEditingExpense,
    editedExpense,
    categories,
  ]);

  function handleOpen(expense: IExpense) {
    setExpenseToDelete(expense);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleDelete() {
    dispatch(deleteExpense(expenseToDelete?._id as string, () => handleClose()));
  }

  function handleDateRangeSearch() {
    setShowBackButton(true);
    dispatch(fetchExpenses({ startDate: fromDate, endDate: toDate }));
  }

  function handleShowMore() {
    dispatch(fetchExpenses({ cursor }));
  }

  function handleBackButton() {
    selectFromDate(new Date());
    selectToDate(new Date());
    setShowBackButton(false);
    dispatch(setDidFinishEditingExpense(false));
    dispatch(setDidFinishDateRangeSearch(false));
  }

  if ((isLoading && count === 0) || (isLoading && !isBackButtonShown && !hasNextPage)) {
    return (
      <ExpensesLoader />
    );
  }

  if (expenses.length === 0) {
    return (
      <NoExpenses />
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.dateContainer}>
        {
          isBackButtonShown && (
            <CustomTooltip title="back to expenses">
              <Fab
                aria-label="search"
                className={classes.backButton}
                size="small"
                disabled={isLoading}
                onClick={handleBackButton}
              >
                <ArrowBackIcon />
              </Fab>
            </CustomTooltip>
          )
        }
        <DateRangeSearch
          isLoading={isLoading}
          isBackButtonShown={isBackButtonShown}
          fromDate={fromDate}
          toDate={toDate}
          selectFromDate={selectFromDate}
          selectToDate={selectToDate}
          dateRangeSearchHandler={handleDateRangeSearch}
        />
      </div>
      <div className={classes.root}>
        <ConfirmDialog
          open={open}
          isDeleting={isDeleting}
          handleClose={handleClose}
          handleDelete={handleDelete}
        />
        <ExpenseList
          isLoading={isLoading}
          expenses={expenses}
          hasMore={hasNextPage}
          handleOpen={handleOpen}
          handleShowMore={handleShowMore}
        />
      </div>
    </div>
  );
}

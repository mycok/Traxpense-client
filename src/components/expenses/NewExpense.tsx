import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RouteChildrenProps } from 'react-router-dom';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';

import ExpenseForm from './ExpenseForm';
import { useAppDispatch, RootState } from '../../redux/store';
import { fetchCategories, Category } from '../../redux/reducers/category/fetchCategories';
import { onValueChange, createExpense } from '../../redux/reducers/expenses/createExpense';
import { setDidFinishDateRangeSearch } from '../../redux/reducers/expenses/fetchOrDeleteExpenses';

const useStyles = makeStyles(() => createStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

type RouteProps = {
  history: RouteChildrenProps['history'],
};

function NewExpense({ history }: RouteProps) {
  const classes = useStyles();
  const [selectedDate, selectDate] = useState<Date>(new Date());
  const [prefCurrency] = useState<string | null>(localStorage.getItem('currency'));
  const dispatch = useAppDispatch();
  const {
    title,
    amount,
    category,
    notes,
    incurredOn,
    isLoading,
  } = useSelector(
    (state: RootState) => state.createExpense,
  );
  const { categories } = useSelector(
    (state: RootState) => state.categories,
  );
  const { didFinishDateRangeSearch } = useSelector(
    (state: RootState) => state.fetchOrDeleteExpenses,
  );

  const expenseFormState = {
    title,
    amount,
    category,
    notes,
    incurredOn,
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { target: { name, value } } = event;

    if (name === 'category') {
      const selectedCategory = categories.find((cat: Category) => cat.title === value);
      dispatch(onValueChange({ name, value: selectedCategory }));
    } else {
      dispatch(onValueChange({ name, value }));
    }
  }

  function handleDateSelection(date: Date) {
    selectDate(date);
  }

  function handleOnSubmit(event: React.FormEvent<HTMLFormElement>) {
    // TODO: add field validation
    event.preventDefault();

    const newExpense = {
      ...expenseFormState,
      category: { _id: category?._id },
      amount: Number(amount),
      incurredOn: selectedDate,
    };

    if (didFinishDateRangeSearch) dispatch(setDidFinishDateRangeSearch(false));
    dispatch(createExpense(newExpense, () => history.push('/expenses')));
  }

  // TODO: add functionality to display toast with server error

  return (
    <div className={classes.container}>
      <Paper elevation={5}>
        <ExpenseForm
          state={expenseFormState}
          isLoading={isLoading}
          prefCurrency={prefCurrency}
          categories={categories}
          path="new-expense"
          selectedDate={selectedDate}
          handleOnSubmit={handleOnSubmit}
          handleOnChange={handleOnChange}
          handleDateSelection={handleDateSelection}
        />
      </Paper>
    </div>
  );
}

export default NewExpense;
